
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.7' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function storage_default(key, value) {
        if (!localStorage.hasOwnProperty(key)) {
            localStorage.setItem(key, value);
        }
    }

    storage_default("danktab_background_image", "https://free4kwallpapers.com/uploads/originals/2018/11/24/northern-lights-wallpaper.jpg");
    storage_default("danktab_mode", "material");
    storage_default("danktab_blur_amount", "8px");
    storage_default("danktab_favourites", JSON.stringify([

        {
            "name": "Google Drive",
            "svg": "<svg width='24' height='22' viewBox='0 0 24 22' fill='none' xmlns='http://www.w3.org/2000/svg'> <g clip-path='url(#clip0)'> <path d='M1.81443 18.3733L2.87285 20.201C3.09278 20.5858 3.40893 20.8881 3.78007 21.108L7.56014 14.5667H0C0 14.9927 0.109966 15.4187 0.329897 15.8035L1.81443 18.3733Z' fill='white' fill-opacity='0.8'/> <path d='M12 6.87114L8.21993 0.329834C7.8488 0.54971 7.53265 0.852039 7.31271 1.23682L0.329897 13.33C0.11401 13.7065 0.00028744 14.1328 0 14.5668H7.56014L12 6.87114Z' fill='white'/> <path d='M20.2198 21.108C20.591 20.8881 20.9071 20.5858 21.1271 20.201L21.5669 19.4451L23.67 15.8035C23.89 15.4187 23.9999 14.9927 23.9999 14.5667H16.4392L18.048 17.7274L20.2198 21.108Z' fill='white' fill-opacity='0.8'/> <path d='M12 6.87113L15.7801 0.329814C15.409 0.109938 14.9828 0 14.543 0H9.45708C9.01722 0 8.5911 0.12368 8.21997 0.329814L12 6.87113Z' fill='white' fill-opacity='0.8'/> <path d='M16.4401 14.5667H7.56034L3.78027 21.108C4.15141 21.3278 4.57752 21.4378 5.01739 21.4378H18.983C19.4229 21.4378 19.849 21.3141 20.2201 21.108L16.4401 14.5667Z' fill='white'/> <path d='M20.1787 7.28341L16.6873 1.23682C16.4674 0.852039 16.1512 0.54971 15.7801 0.329834L12 6.87114L16.4399 14.5668H23.9863C23.9863 14.1408 23.8763 13.7148 23.6564 13.33L20.1787 7.28341Z' fill='white'/> </g> <defs> <clipPath id='clip0'> <rect width='24' height='21.4379' fill='white'/> </clipPath> </defs> </svg>",
            "href": "https://drive.google.com",
            "is_first": true,
            "is_last": false
        },
        {
            "name": "Google Docs",
            "svg": "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'> <path fill-rule='evenodd' clip-rule='evenodd' d='M19.0909 24H4.90907C4.00907 24 3.27271 23.2636 3.27271 22.3636V1.63636C3.27271 0.736364 4.00907 0 4.90907 0H14.7272L14.7273 6H20.7272V22.3636C20.7272 23.2636 19.9909 24 19.0909 24ZM16.9091 10.6364H7.09089V9.27273H16.9091V10.6364ZM16.9091 12.5455H7.09089V13.9091H16.9091V12.5455ZM14.1818 15.8182H7.09089V17.1818H14.1818V15.8182Z' fill='white' fill-opacity='0.8'/> <path d='M14.7273 0L20.7273 6H14.7273V0Z' fill='white'/> </svg>",
            "href": "https://docs.google.com",
            "is_first": false,
            "is_last": false
        },
        {
            "name": "Github",
            "svg": "<svg width='24' height='24' viewBox='0 0 1024 1024' fill='none' xmlns='http://www.w3.org/2000/svg'> <path fill-rule='evenodd' clip-rule='evenodd' d='M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z' transform='scale(64)' fill='#ffffff'/> </svg>",
            "href": "https://github.com",
            "is_first": false,
            "is_last": false
        },
        {
            "name": "Reddit",
            "svg": "<svg width='24' height='22' viewBox='0 0 24 22' fill='none' xmlns='http://www.w3.org/2000/svg'> <path d='M24 10.6686C24 9.23491 22.8175 8.09636 21.3764 8.09636C20.6668 8.09636 20.0214 8.37029 19.5484 8.81321C17.7421 7.54811 15.2688 6.72594 12.5161 6.62062L13.7203 1.09649L17.6343 1.91867C17.6776 2.88861 18.4946 3.66873 19.5055 3.66873C20.5378 3.66873 21.3764 2.84656 21.3764 1.83417C21.3764 0.822173 20.5378 0 19.5055 0C18.7744 0 18.129 0.421698 17.8279 1.03322L13.4625 0.126549C13.3335 0.105326 13.2044 0.126549 13.1182 0.189823C13.0108 0.253097 12.9462 0.358423 12.925 0.484972L11.5913 6.64144C8.79571 6.72594 6.2795 7.54811 4.45157 8.83443C3.97855 8.39151 3.33317 8.11758 2.62364 8.11758C1.1613 8.11758 0 9.27696 0 10.6898C0 11.7439 0.644986 12.6293 1.54853 13.0302C1.50524 13.2829 1.48399 13.536 1.48399 13.8103C1.48399 17.7738 6.19372 21 12.0002 21C17.8067 21 22.5164 17.795 22.5164 13.8103C22.5164 13.5572 22.4948 13.2829 22.4519 13.0302C23.355 12.6293 24 11.7226 24 10.6686ZM5.97845 12.5028C5.97845 11.4908 6.81706 10.6686 7.84968 10.6686C8.8819 10.6686 9.7205 11.4908 9.7205 12.5028C9.7205 13.5148 8.8819 14.3373 7.84968 14.3373C6.81706 14.3582 5.97845 13.5148 5.97845 12.5028ZM16.4518 17.3733C15.1614 18.6384 12.7097 18.7229 12.0002 18.7229C11.269 18.7229 8.81736 18.6172 7.54823 17.3733C7.35501 17.1835 7.35501 16.8883 7.54823 16.6985C7.74185 16.5091 8.04289 16.5091 8.23651 16.6985C9.05387 17.4999 10.7744 17.7738 12.0002 17.7738C13.226 17.7738 14.9678 17.4999 15.7635 16.6985C15.9571 16.5091 16.2582 16.5091 16.4518 16.6985C16.6237 16.8883 16.6237 17.1835 16.4518 17.3733ZM16.1074 14.3582C15.0752 14.3582 14.2366 13.536 14.2366 12.524C14.2366 11.512 15.0752 10.6898 16.1074 10.6898C17.1401 10.6898 17.9787 11.512 17.9787 12.524C17.9787 13.5148 17.1401 14.3582 16.1074 14.3582Z' fill='white'/> </svg>",
            "href": "https://reddit.com",
            "is_first": false,
            "is_last": false
        },
        {
            "name": "YouTube",
            "svg": "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'> <g clip-path='url(#clip0)'> <path d='M11.9928 3.55957C11.9928 3.55957 4.49166 3.55958 2.60898 4.04878C1.60093 4.33044 0.770875 5.16051 0.489213 6.18338C1.11459e-05 8.06607 0 11.965 0 11.965C0 11.965 1.11459e-05 15.8786 0.489213 17.7317C0.770875 18.7546 1.5861 19.5698 2.60898 19.8515C4.50649 20.3555 11.9928 20.3555 11.9928 20.3555C11.9928 20.3555 19.5088 20.3555 21.3914 19.8663C22.4143 19.5846 23.2295 18.7842 23.4963 17.7465C24.0004 15.8786 24.0004 11.9798 24.0004 11.9798C24.0004 11.9798 24.0152 8.06607 23.4963 6.18338C23.2295 5.16051 22.4143 4.34529 21.3914 4.07845C19.5088 3.55959 11.9928 3.55957 11.9928 3.55957V3.55957ZM9.60604 8.36271L15.8472 11.965L9.60604 15.5524V8.36271V8.36271Z' fill='white'/> </g> <defs> <clipPath id='clip0'> <rect width='24' height='24' fill='white'/> </clipPath> </defs> </svg>",
            "href": "https://youtube.com",
            "is_first": false,
            "is_last": true
        }
    ]));
    storage_default("danktab_search_engine", "DuckDuckGo");

    const background_image_store = writable(localStorage.getItem("danktab_background_image"));
    const mode_store = writable(localStorage.getItem("danktab_mode"));
    const blur_amount_store = writable(localStorage.getItem("danktab_blur_amount"));
    const favourites_store = writable(JSON.parse(localStorage.getItem("danktab_favourites")));
    const search_engine_store = writable(localStorage.getItem("danktab_search_engine"));

    background_image_store.subscribe(
        value => localStorage.setItem("danktab_background_image", value)
    );

    mode_store.subscribe(
        value => localStorage.setItem("danktab_mode", value)
    );

    blur_amount_store.subscribe(
        value => localStorage.setItem("danktab_blur_amount", value)
    );

    favourites_store.subscribe(
        value => localStorage.setItem("danktab_favourites", JSON.stringify(value))
    );

    search_engine_store.subscribe(
        value => localStorage.setItem("danktab_search_engine", value)
    );

    function toClassName(value) {
      let result = '';

      if (typeof value === 'string' || typeof value === 'number') {
        result += value;
      } else if (typeof value === 'object') {
        if (Array.isArray(value)) {
          result = value.map(toClassName).filter(Boolean).join(' ');
        } else {
          for (let key in value) {
            if (value[key]) {
              result && (result += ' ');
              result += key;
            }
          }
        }
      }

      return result;
    }

    function classnames(...args) {
      return args.map(toClassName).filter(Boolean).join(' ');
    }

    /* node_modules\sveltestrap\src\Container.svelte generated by Svelte v3.29.7 */
    const file = "node_modules\\sveltestrap\\src\\Container.svelte";

    function create_fragment(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let div_levels = [/*$$restProps*/ ctx[1], { class: /*classes*/ ctx[0] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file, 10, 0, 220);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1],
    				(!current || dirty & /*classes*/ 1) && { class: /*classes*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	const omit_props_names = ["class","fluid"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Container", slots, ['default']);
    	let { class: className = "" } = $$props;
    	let { fluid = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("class" in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ("fluid" in $$new_props) $$invalidate(3, fluid = $$new_props.fluid);
    		if ("$$scope" in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ classnames, className, fluid, classes });

    	$$self.$inject_state = $$new_props => {
    		if ("className" in $$props) $$invalidate(2, className = $$new_props.className);
    		if ("fluid" in $$props) $$invalidate(3, fluid = $$new_props.fluid);
    		if ("classes" in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	let classes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, fluid*/ 12) {
    			 $$invalidate(0, classes = classnames(className, fluid ? "container-fluid" : "container"));
    		}
    	};

    	return [classes, $$restProps, className, fluid, $$scope, slots];
    }

    class Container extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { class: 2, fluid: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Container",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get class() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fluid() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fluid(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\favourite.svelte generated by Svelte v3.29.7 */
    const file$1 = "src\\components\\favourite.svelte";

    function create_fragment$1(ctx) {
    	let button;
    	let button_class_value;
    	let button_id_value;
    	let button_onclick_value;
    	let button_full_object_value;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", button_class_value = "favourite " + (/*is_last*/ ctx[4] ? "last" : "") + " " + (/*is_first*/ ctx[3] ? "first" : "") + " " + /*mode*/ ctx[7] + " svelte-1xu95w5");
    			set_style(button, "backdrop-filter", "blur(" + /*blur_amount*/ ctx[6] + ")");
    			attr_dev(button, "id", button_id_value = lowercase(/*name*/ ctx[0]));
    			attr_dev(button, "onclick", button_onclick_value = "window.location.href='" + /*href*/ ctx[2] + "'");
    			attr_dev(button, "draggable", "true");
    			attr_dev(button, "full-object", button_full_object_value = JSON.stringify(/*full_object*/ ctx[5]));
    			add_location(button, file$1, 76, 0, 1469);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			button.innerHTML = /*svg*/ ctx[1];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*svg*/ 2) button.innerHTML = /*svg*/ ctx[1];
    			if (dirty & /*is_last, is_first, mode*/ 152 && button_class_value !== (button_class_value = "favourite " + (/*is_last*/ ctx[4] ? "last" : "") + " " + (/*is_first*/ ctx[3] ? "first" : "") + " " + /*mode*/ ctx[7] + " svelte-1xu95w5")) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*blur_amount*/ 64) {
    				set_style(button, "backdrop-filter", "blur(" + /*blur_amount*/ ctx[6] + ")");
    			}

    			if (dirty & /*name*/ 1 && button_id_value !== (button_id_value = lowercase(/*name*/ ctx[0]))) {
    				attr_dev(button, "id", button_id_value);
    			}

    			if (dirty & /*href*/ 4 && button_onclick_value !== (button_onclick_value = "window.location.href='" + /*href*/ ctx[2] + "'")) {
    				attr_dev(button, "onclick", button_onclick_value);
    			}

    			if (dirty & /*full_object*/ 32 && button_full_object_value !== (button_full_object_value = JSON.stringify(/*full_object*/ ctx[5]))) {
    				attr_dev(button, "full-object", button_full_object_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function lowercase(x) {
    	x = x.toLowerCase().split(" ").join("-");
    	return x;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Favourite", slots, []);
    	let { name } = $$props;
    	let { svg } = $$props;
    	let { href } = $$props;
    	let { is_first } = $$props;
    	let { is_last } = $$props;
    	let { full_object } = $$props;
    	let blur_amount;
    	let mode;

    	blur_amount_store.subscribe(value => {
    		$$invalidate(6, blur_amount = value);
    	});

    	mode_store.subscribe(value => {
    		$$invalidate(7, mode = value);
    	});

    	const writable_props = ["name", "svg", "href", "is_first", "is_last", "full_object"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Favourite> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("svg" in $$props) $$invalidate(1, svg = $$props.svg);
    		if ("href" in $$props) $$invalidate(2, href = $$props.href);
    		if ("is_first" in $$props) $$invalidate(3, is_first = $$props.is_first);
    		if ("is_last" in $$props) $$invalidate(4, is_last = $$props.is_last);
    		if ("full_object" in $$props) $$invalidate(5, full_object = $$props.full_object);
    	};

    	$$self.$capture_state = () => ({
    		mode_store,
    		blur_amount_store,
    		name,
    		svg,
    		href,
    		is_first,
    		is_last,
    		full_object,
    		blur_amount,
    		mode,
    		lowercase
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("svg" in $$props) $$invalidate(1, svg = $$props.svg);
    		if ("href" in $$props) $$invalidate(2, href = $$props.href);
    		if ("is_first" in $$props) $$invalidate(3, is_first = $$props.is_first);
    		if ("is_last" in $$props) $$invalidate(4, is_last = $$props.is_last);
    		if ("full_object" in $$props) $$invalidate(5, full_object = $$props.full_object);
    		if ("blur_amount" in $$props) $$invalidate(6, blur_amount = $$props.blur_amount);
    		if ("mode" in $$props) $$invalidate(7, mode = $$props.mode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, svg, href, is_first, is_last, full_object, blur_amount, mode];
    }

    class Favourite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			name: 0,
    			svg: 1,
    			href: 2,
    			is_first: 3,
    			is_last: 4,
    			full_object: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Favourite",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Favourite> was created without expected prop 'name'");
    		}

    		if (/*svg*/ ctx[1] === undefined && !("svg" in props)) {
    			console.warn("<Favourite> was created without expected prop 'svg'");
    		}

    		if (/*href*/ ctx[2] === undefined && !("href" in props)) {
    			console.warn("<Favourite> was created without expected prop 'href'");
    		}

    		if (/*is_first*/ ctx[3] === undefined && !("is_first" in props)) {
    			console.warn("<Favourite> was created without expected prop 'is_first'");
    		}

    		if (/*is_last*/ ctx[4] === undefined && !("is_last" in props)) {
    			console.warn("<Favourite> was created without expected prop 'is_last'");
    		}

    		if (/*full_object*/ ctx[5] === undefined && !("full_object" in props)) {
    			console.warn("<Favourite> was created without expected prop 'full_object'");
    		}
    	}

    	get name() {
    		throw new Error("<Favourite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Favourite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get svg() {
    		throw new Error("<Favourite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set svg(value) {
    		throw new Error("<Favourite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Favourite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Favourite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get is_first() {
    		throw new Error("<Favourite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set is_first(value) {
    		throw new Error("<Favourite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get is_last() {
    		throw new Error("<Favourite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set is_last(value) {
    		throw new Error("<Favourite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get full_object() {
    		throw new Error("<Favourite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set full_object(value) {
    		throw new Error("<Favourite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\settings.svelte generated by Svelte v3.29.7 */
    const file$2 = "src\\components\\settings.svelte";

    function create_fragment$2(ctx) {
    	let button0;
    	let svg;
    	let path0;
    	let path1;
    	let button0_class_value;
    	let t0;
    	let div17;
    	let div16;
    	let div15;
    	let div14;
    	let div0;
    	let h5;
    	let t2;
    	let div12;
    	let p0;
    	let t4;
    	let input0;
    	let t5;
    	let br0;
    	let t6;
    	let br1;
    	let t7;
    	let p1;
    	let t9;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let t13;
    	let br2;
    	let t14;
    	let br3;
    	let t15;
    	let p2;
    	let t17;
    	let input1;
    	let t18;
    	let br4;
    	let t19;
    	let br5;
    	let t20;
    	let p3;
    	let t22;
    	let select1;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let t27;
    	let br6;
    	let t28;
    	let br7;
    	let t29;
    	let p4;
    	let t31;
    	let div11;
    	let button1;
    	let t33;
    	let div2;
    	let div1;
    	let p5;
    	let t35;
    	let input2;
    	let input2_value_value;
    	let t36;
    	let p6;
    	let t38;
    	let input3;
    	let input3_value_value;
    	let t39;
    	let p7;
    	let t41;
    	let input4;
    	let input4_value_value;
    	let t42;
    	let button2;
    	let t44;
    	let div4;
    	let div3;
    	let p8;
    	let t46;
    	let input5;
    	let input5_value_value;
    	let t47;
    	let p9;
    	let t49;
    	let input6;
    	let input6_value_value;
    	let t50;
    	let p10;
    	let t52;
    	let input7;
    	let input7_value_value;
    	let t53;
    	let button3;
    	let t55;
    	let div6;
    	let div5;
    	let p11;
    	let t57;
    	let input8;
    	let input8_value_value;
    	let t58;
    	let p12;
    	let t60;
    	let input9;
    	let input9_value_value;
    	let t61;
    	let p13;
    	let t63;
    	let input10;
    	let input10_value_value;
    	let t64;
    	let button4;
    	let t66;
    	let div8;
    	let div7;
    	let p14;
    	let t68;
    	let input11;
    	let input11_value_value;
    	let t69;
    	let p15;
    	let t71;
    	let input12;
    	let input12_value_value;
    	let t72;
    	let p16;
    	let t74;
    	let input13;
    	let input13_value_value;
    	let t75;
    	let button5;
    	let t77;
    	let div10;
    	let div9;
    	let p17;
    	let t79;
    	let input14;
    	let input14_value_value;
    	let t80;
    	let p18;
    	let t82;
    	let input15;
    	let input15_value_value;
    	let t83;
    	let p19;
    	let t85;
    	let input16;
    	let input16_value_value;
    	let t86;
    	let div13;
    	let button6;
    	let t88;
    	let button7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t0 = space();
    			div17 = element("div");
    			div16 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = "Settings";
    			t2 = space();
    			div12 = element("div");
    			p0 = element("p");
    			p0.textContent = "Background Image";
    			t4 = space();
    			input0 = element("input");
    			t5 = space();
    			br0 = element("br");
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			p1 = element("p");
    			p1.textContent = "Mode";
    			t9 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Material\r\n                        ";
    			option1 = element("option");
    			option1.textContent = "Cupertino\r\n                        ";
    			option2 = element("option");
    			option2.textContent = "Fluid";
    			t13 = space();
    			br2 = element("br");
    			t14 = space();
    			br3 = element("br");
    			t15 = space();
    			p2 = element("p");
    			p2.textContent = "Blur Amount";
    			t17 = space();
    			input1 = element("input");
    			t18 = space();
    			br4 = element("br");
    			t19 = space();
    			br5 = element("br");
    			t20 = space();
    			p3 = element("p");
    			p3.textContent = "Search Engine";
    			t22 = space();
    			select1 = element("select");
    			option3 = element("option");
    			option3.textContent = "DuckDuckGo\r\n                        ";
    			option4 = element("option");
    			option4.textContent = "Google\r\n                        ";
    			option5 = element("option");
    			option5.textContent = "Yahoo!\r\n                        ";
    			option6 = element("option");
    			option6.textContent = "Ecosia";
    			t27 = space();
    			br6 = element("br");
    			t28 = space();
    			br7 = element("br");
    			t29 = space();
    			p4 = element("p");
    			p4.textContent = "Favourites";
    			t31 = space();
    			div11 = element("div");
    			button1 = element("button");
    			button1.textContent = "Item 1";
    			t33 = space();
    			div2 = element("div");
    			div1 = element("div");
    			p5 = element("p");
    			p5.textContent = "Name";
    			t35 = space();
    			input2 = element("input");
    			t36 = space();
    			p6 = element("p");
    			p6.textContent = "SVG";
    			t38 = space();
    			input3 = element("input");
    			t39 = space();
    			p7 = element("p");
    			p7.textContent = "URL";
    			t41 = space();
    			input4 = element("input");
    			t42 = space();
    			button2 = element("button");
    			button2.textContent = "Item 2";
    			t44 = space();
    			div4 = element("div");
    			div3 = element("div");
    			p8 = element("p");
    			p8.textContent = "Name";
    			t46 = space();
    			input5 = element("input");
    			t47 = space();
    			p9 = element("p");
    			p9.textContent = "SVG";
    			t49 = space();
    			input6 = element("input");
    			t50 = space();
    			p10 = element("p");
    			p10.textContent = "URL";
    			t52 = space();
    			input7 = element("input");
    			t53 = space();
    			button3 = element("button");
    			button3.textContent = "Item 3";
    			t55 = space();
    			div6 = element("div");
    			div5 = element("div");
    			p11 = element("p");
    			p11.textContent = "Name";
    			t57 = space();
    			input8 = element("input");
    			t58 = space();
    			p12 = element("p");
    			p12.textContent = "SVG";
    			t60 = space();
    			input9 = element("input");
    			t61 = space();
    			p13 = element("p");
    			p13.textContent = "URL";
    			t63 = space();
    			input10 = element("input");
    			t64 = space();
    			button4 = element("button");
    			button4.textContent = "Item 4";
    			t66 = space();
    			div8 = element("div");
    			div7 = element("div");
    			p14 = element("p");
    			p14.textContent = "Name";
    			t68 = space();
    			input11 = element("input");
    			t69 = space();
    			p15 = element("p");
    			p15.textContent = "SVG";
    			t71 = space();
    			input12 = element("input");
    			t72 = space();
    			p16 = element("p");
    			p16.textContent = "URL";
    			t74 = space();
    			input13 = element("input");
    			t75 = space();
    			button5 = element("button");
    			button5.textContent = "Item 5";
    			t77 = space();
    			div10 = element("div");
    			div9 = element("div");
    			p17 = element("p");
    			p17.textContent = "Name";
    			t79 = space();
    			input14 = element("input");
    			t80 = space();
    			p18 = element("p");
    			p18.textContent = "SVG";
    			t82 = space();
    			input15 = element("input");
    			t83 = space();
    			p19 = element("p");
    			p19.textContent = "URL";
    			t85 = space();
    			input16 = element("input");
    			t86 = space();
    			div13 = element("div");
    			button6 = element("button");
    			button6.textContent = "Close";
    			t88 = space();
    			button7 = element("button");
    			button7.textContent = "Save";
    			attr_dev(path0, "d", "M0 0h48v48h-48z");
    			attr_dev(path0, "fill", "none");
    			add_location(path0, file$2, 195, 8, 5269);
    			attr_dev(path1, "d", "M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97l-.75-5.3c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3c-1.22.51-2.35 1.17-3.38 1.97l-4.98-2.01c-.45-.17-.97 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31c-.08.64-.14 1.29-.14 1.95s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3c1.22-.51 2.35-1.17 3.38-1.97l4.98 2.01c.45.17.97 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zm-14.86 5.05c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z");
    			attr_dev(path1, "fill", "white");
    			add_location(path1, file$2, 196, 8, 5319);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 48 48");
    			add_location(svg, file$2, 190, 4, 5140);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", button0_class_value = "settings " + /*mode*/ ctx[2] + " svelte-kmimw");
    			attr_dev(button0, "data-toggle", "modal");
    			attr_dev(button0, "data-target", "#settings-modal");
    			set_style(button0, "backdrop-filter", "blur(" + /*blur_amount*/ ctx[1] + ")");
    			attr_dev(button0, "data-backdrop", "static");
    			attr_dev(button0, "data-keyboard", "false");
    			add_location(button0, file$2, 182, 0, 4912);
    			attr_dev(h5, "class", "modal-title");
    			attr_dev(h5, "id", "settings-modal-label");
    			add_location(h5, file$2, 215, 20, 6615);
    			attr_dev(div0, "class", "modal-header justify-content-center svelte-kmimw");
    			add_location(div0, file$2, 214, 16, 6544);
    			add_location(p0, file$2, 220, 20, 6814);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "background-image");
    			attr_dev(input0, "class", "svelte-kmimw");
    			add_location(input0, file$2, 221, 20, 6859);
    			add_location(br0, file$2, 225, 20, 7029);
    			add_location(br1, file$2, 226, 20, 7057);
    			add_location(p1, file$2, 227, 20, 7085);
    			attr_dev(option0, "class", "mode-option");
    			option0.__value = "material";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 231, 24, 7262);
    			attr_dev(option1, "class", "mode-option");
    			option1.__value = "cupertino";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 234, 24, 7406);
    			attr_dev(option2, "class", "mode-option");
    			option2.__value = "fluid";
    			option2.value = option2.__value;
    			add_location(option2, file$2, 237, 24, 7552);
    			attr_dev(select0, "class", "mode-select browser-default custom-select svelte-kmimw");
    			attr_dev(select0, "id", "mode");
    			add_location(select0, file$2, 228, 20, 7118);
    			add_location(br2, file$2, 239, 20, 7661);
    			add_location(br3, file$2, 240, 20, 7689);
    			add_location(p2, file$2, 241, 20, 7717);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "blur-amount");
    			input1.value = /*blur_amount*/ ctx[1];
    			attr_dev(input1, "class", "svelte-kmimw");
    			add_location(input1, file$2, 242, 20, 7757);
    			add_location(br4, file$2, 243, 20, 7837);
    			add_location(br5, file$2, 244, 20, 7865);
    			add_location(p3, file$2, 245, 20, 7893);
    			attr_dev(option3, "class", "search-engine-option");
    			option3.__value = "DuckDuckGo";
    			option3.value = option3.__value;
    			add_location(option3, file$2, 249, 24, 8088);
    			attr_dev(option4, "class", "search-engine-option");
    			option4.__value = "Google";
    			option4.value = option4.__value;
    			add_location(option4, file$2, 252, 24, 8245);
    			attr_dev(option5, "class", "search-engine-option");
    			option5.__value = "Yahoo!";
    			option5.value = option5.__value;
    			add_location(option5, file$2, 255, 24, 8394);
    			attr_dev(option6, "class", "search-engine-option");
    			option6.__value = "Ecosia";
    			option6.value = option6.__value;
    			add_location(option6, file$2, 258, 24, 8543);
    			attr_dev(select1, "class", "mode-select browser-default custom-select svelte-kmimw");
    			attr_dev(select1, "id", "search-engine");
    			add_location(select1, file$2, 246, 20, 7935);
    			add_location(br6, file$2, 262, 20, 8719);
    			add_location(br7, file$2, 263, 20, 8747);
    			add_location(p4, file$2, 264, 20, 8775);
    			attr_dev(button1, "class", "btn btn-block mb-4 svelte-kmimw");
    			attr_dev(button1, "data-toggle", "collapse");
    			attr_dev(button1, "data-target", "#favourites-0");
    			attr_dev(button1, "aria-expanded", "false");
    			attr_dev(button1, "aria-controls", "favourites-0");
    			add_location(button1, file$2, 266, 24, 8845);
    			add_location(p5, file$2, 274, 32, 9305);
    			attr_dev(input2, "class", "mb-4 svelte-kmimw");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "favourites-name-0");
    			input2.value = input2_value_value = /*favourites*/ ctx[3][0].name;
    			add_location(input2, file$2, 275, 32, 9350);
    			add_location(p6, file$2, 280, 32, 9616);
    			attr_dev(input3, "class", "mb-4 svelte-kmimw");
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "id", "favourites-svg-0");
    			input3.value = input3_value_value = /*favourites*/ ctx[3][0].svg;
    			add_location(input3, file$2, 281, 32, 9660);
    			add_location(p7, file$2, 286, 32, 9924);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "id", "favourites-href-0");
    			input4.value = input4_value_value = /*favourites*/ ctx[3][0].href;
    			attr_dev(input4, "class", "svelte-kmimw");
    			add_location(input4, file$2, 287, 32, 9968);
    			attr_dev(div1, "class", "card card-body mb-4 svelte-kmimw");
    			add_location(div1, file$2, 273, 28, 9238);
    			attr_dev(div2, "class", "collapse");
    			attr_dev(div2, "id", "favourites-0");
    			add_location(div2, file$2, 272, 24, 9168);
    			attr_dev(button2, "class", "btn btn-block mb-4 svelte-kmimw");
    			attr_dev(button2, "data-toggle", "collapse");
    			attr_dev(button2, "data-target", "#favourites-1");
    			attr_dev(button2, "aria-expanded", "false");
    			attr_dev(button2, "aria-controls", "favourites-1");
    			add_location(button2, file$2, 293, 24, 10244);
    			add_location(p8, file$2, 301, 32, 10704);
    			attr_dev(input5, "class", "mb-4 svelte-kmimw");
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "id", "favourites-name-1");
    			input5.value = input5_value_value = /*favourites*/ ctx[3][1].name;
    			add_location(input5, file$2, 302, 32, 10749);
    			add_location(p9, file$2, 307, 32, 11015);
    			attr_dev(input6, "class", "mb-4 svelte-kmimw");
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "id", "favourites-svg-1");
    			input6.value = input6_value_value = /*favourites*/ ctx[3][1].svg;
    			add_location(input6, file$2, 308, 32, 11059);
    			add_location(p10, file$2, 313, 32, 11323);
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "id", "favourites-href-1");
    			input7.value = input7_value_value = /*favourites*/ ctx[3][1].href;
    			attr_dev(input7, "class", "svelte-kmimw");
    			add_location(input7, file$2, 314, 32, 11367);
    			attr_dev(div3, "class", "card card-body mb-4 svelte-kmimw");
    			add_location(div3, file$2, 300, 28, 10637);
    			attr_dev(div4, "class", "collapse");
    			attr_dev(div4, "id", "favourites-1");
    			add_location(div4, file$2, 299, 24, 10567);
    			attr_dev(button3, "class", "btn btn-block mb-4 svelte-kmimw");
    			attr_dev(button3, "data-toggle", "collapse");
    			attr_dev(button3, "data-target", "#favourites-2");
    			attr_dev(button3, "aria-expanded", "false");
    			attr_dev(button3, "aria-controls", "favourites-2");
    			add_location(button3, file$2, 320, 24, 11643);
    			add_location(p11, file$2, 328, 32, 12103);
    			attr_dev(input8, "class", "mb-4 svelte-kmimw");
    			attr_dev(input8, "type", "text");
    			attr_dev(input8, "id", "favourites-name-2");
    			input8.value = input8_value_value = /*favourites*/ ctx[3][2].name;
    			add_location(input8, file$2, 329, 32, 12148);
    			add_location(p12, file$2, 334, 32, 12414);
    			attr_dev(input9, "class", "mb-4 svelte-kmimw");
    			attr_dev(input9, "type", "text");
    			attr_dev(input9, "id", "favourites-svg-2");
    			input9.value = input9_value_value = /*favourites*/ ctx[3][2].svg;
    			add_location(input9, file$2, 335, 32, 12458);
    			add_location(p13, file$2, 340, 32, 12722);
    			attr_dev(input10, "type", "text");
    			attr_dev(input10, "id", "favourites-href-2");
    			input10.value = input10_value_value = /*favourites*/ ctx[3][2].href;
    			attr_dev(input10, "class", "svelte-kmimw");
    			add_location(input10, file$2, 341, 32, 12766);
    			attr_dev(div5, "class", "card card-body mb-4 svelte-kmimw");
    			add_location(div5, file$2, 327, 28, 12036);
    			attr_dev(div6, "class", "collapse");
    			attr_dev(div6, "id", "favourites-2");
    			add_location(div6, file$2, 326, 24, 11966);
    			attr_dev(button4, "class", "btn btn-block mb-4 svelte-kmimw");
    			attr_dev(button4, "data-toggle", "collapse");
    			attr_dev(button4, "data-target", "#favourites-3");
    			attr_dev(button4, "aria-expanded", "false");
    			attr_dev(button4, "aria-controls", "favourites-3");
    			add_location(button4, file$2, 347, 24, 13042);
    			add_location(p14, file$2, 355, 32, 13502);
    			attr_dev(input11, "class", "mb-4 svelte-kmimw");
    			attr_dev(input11, "type", "text");
    			attr_dev(input11, "id", "favourites-name-3");
    			input11.value = input11_value_value = /*favourites*/ ctx[3][3].name;
    			add_location(input11, file$2, 356, 32, 13547);
    			add_location(p15, file$2, 361, 32, 13813);
    			attr_dev(input12, "class", "mb-4 svelte-kmimw");
    			attr_dev(input12, "type", "text");
    			attr_dev(input12, "id", "favourites-svg-3");
    			input12.value = input12_value_value = /*favourites*/ ctx[3][3].svg;
    			add_location(input12, file$2, 362, 32, 13857);
    			add_location(p16, file$2, 367, 32, 14121);
    			attr_dev(input13, "type", "text");
    			attr_dev(input13, "id", "favourites-href-3");
    			input13.value = input13_value_value = /*favourites*/ ctx[3][3].href;
    			attr_dev(input13, "class", "svelte-kmimw");
    			add_location(input13, file$2, 368, 32, 14165);
    			attr_dev(div7, "class", "card card-body mb-4 svelte-kmimw");
    			add_location(div7, file$2, 354, 28, 13435);
    			attr_dev(div8, "class", "collapse");
    			attr_dev(div8, "id", "favourites-3");
    			add_location(div8, file$2, 353, 24, 13365);
    			attr_dev(button5, "class", "btn btn-block mb-4 svelte-kmimw");
    			attr_dev(button5, "data-toggle", "collapse");
    			attr_dev(button5, "data-target", "#favourites-4");
    			attr_dev(button5, "aria-expanded", "false");
    			attr_dev(button5, "aria-controls", "favourites-4");
    			add_location(button5, file$2, 374, 24, 14441);
    			add_location(p17, file$2, 382, 32, 14901);
    			attr_dev(input14, "class", "mb-4 svelte-kmimw");
    			attr_dev(input14, "type", "text");
    			attr_dev(input14, "id", "favourites-name-4");
    			input14.value = input14_value_value = /*favourites*/ ctx[3][4].name;
    			add_location(input14, file$2, 383, 32, 14946);
    			add_location(p18, file$2, 388, 32, 15212);
    			attr_dev(input15, "class", "mb-4 svelte-kmimw");
    			attr_dev(input15, "type", "text");
    			attr_dev(input15, "id", "favourites-svg-4");
    			input15.value = input15_value_value = /*favourites*/ ctx[3][4].svg;
    			add_location(input15, file$2, 389, 32, 15256);
    			add_location(p19, file$2, 394, 32, 15520);
    			attr_dev(input16, "type", "text");
    			attr_dev(input16, "id", "favourites-href-4");
    			input16.value = input16_value_value = /*favourites*/ ctx[3][4].href;
    			attr_dev(input16, "class", "svelte-kmimw");
    			add_location(input16, file$2, 395, 32, 15564);
    			attr_dev(div9, "class", "card card-body mb-4 svelte-kmimw");
    			add_location(div9, file$2, 381, 28, 14834);
    			attr_dev(div10, "class", "collapse");
    			attr_dev(div10, "id", "favourites-4");
    			add_location(div10, file$2, 380, 24, 14764);
    			add_location(div11, file$2, 265, 20, 8814);
    			attr_dev(div12, "class", "modal-body svelte-kmimw");
    			add_location(div12, file$2, 219, 16, 6768);
    			attr_dev(button6, "type", "button");
    			attr_dev(button6, "class", "btn settings-modal-button svelte-kmimw");
    			attr_dev(button6, "data-dismiss", "modal");
    			add_location(button6, file$2, 404, 20, 15955);
    			attr_dev(button7, "type", "button");
    			attr_dev(button7, "class", "btn settings-modal-button svelte-kmimw");
    			attr_dev(button7, "data-dismiss", "modal");
    			add_location(button7, file$2, 408, 20, 16143);
    			attr_dev(div13, "class", "modal-footer justify-content-center svelte-kmimw");
    			add_location(div13, file$2, 403, 16, 15884);
    			attr_dev(div14, "class", "modal-content settings-modal svelte-kmimw");
    			set_style(div14, "backdrop-filter", "blur(" + /*blur_amount*/ ctx[1] + ")");
    			add_location(div14, file$2, 211, 12, 6404);
    			attr_dev(div15, "class", "modal-dialog modal-dialog-centered");
    			attr_dev(div15, "role", "document");
    			add_location(div15, file$2, 210, 8, 6326);
    			attr_dev(div16, "class", "modal fade");
    			attr_dev(div16, "id", "settings-modal");
    			attr_dev(div16, "tabindex", "-1");
    			attr_dev(div16, "role", "dialog");
    			attr_dev(div16, "aria-labelledby", "settings-modal-label");
    			attr_dev(div16, "aria-hidden", "true");
    			add_location(div16, file$2, 203, 4, 6132);
    			set_style(div17, "text-align", "left");
    			add_location(div17, file$2, 202, 0, 6095);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			append_dev(button0, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div17, anchor);
    			append_dev(div17, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div0);
    			append_dev(div0, h5);
    			append_dev(div14, t2);
    			append_dev(div14, div12);
    			append_dev(div12, p0);
    			append_dev(div12, t4);
    			append_dev(div12, input0);
    			set_input_value(input0, /*background_image*/ ctx[0]);
    			append_dev(div12, t5);
    			append_dev(div12, br0);
    			append_dev(div12, t6);
    			append_dev(div12, br1);
    			append_dev(div12, t7);
    			append_dev(div12, p1);
    			append_dev(div12, t9);
    			append_dev(div12, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			append_dev(div12, t13);
    			append_dev(div12, br2);
    			append_dev(div12, t14);
    			append_dev(div12, br3);
    			append_dev(div12, t15);
    			append_dev(div12, p2);
    			append_dev(div12, t17);
    			append_dev(div12, input1);
    			append_dev(div12, t18);
    			append_dev(div12, br4);
    			append_dev(div12, t19);
    			append_dev(div12, br5);
    			append_dev(div12, t20);
    			append_dev(div12, p3);
    			append_dev(div12, t22);
    			append_dev(div12, select1);
    			append_dev(select1, option3);
    			append_dev(select1, option4);
    			append_dev(select1, option5);
    			append_dev(select1, option6);
    			append_dev(div12, t27);
    			append_dev(div12, br6);
    			append_dev(div12, t28);
    			append_dev(div12, br7);
    			append_dev(div12, t29);
    			append_dev(div12, p4);
    			append_dev(div12, t31);
    			append_dev(div12, div11);
    			append_dev(div11, button1);
    			append_dev(div11, t33);
    			append_dev(div11, div2);
    			append_dev(div2, div1);
    			append_dev(div1, p5);
    			append_dev(div1, t35);
    			append_dev(div1, input2);
    			append_dev(div1, t36);
    			append_dev(div1, p6);
    			append_dev(div1, t38);
    			append_dev(div1, input3);
    			append_dev(div1, t39);
    			append_dev(div1, p7);
    			append_dev(div1, t41);
    			append_dev(div1, input4);
    			append_dev(div11, t42);
    			append_dev(div11, button2);
    			append_dev(div11, t44);
    			append_dev(div11, div4);
    			append_dev(div4, div3);
    			append_dev(div3, p8);
    			append_dev(div3, t46);
    			append_dev(div3, input5);
    			append_dev(div3, t47);
    			append_dev(div3, p9);
    			append_dev(div3, t49);
    			append_dev(div3, input6);
    			append_dev(div3, t50);
    			append_dev(div3, p10);
    			append_dev(div3, t52);
    			append_dev(div3, input7);
    			append_dev(div11, t53);
    			append_dev(div11, button3);
    			append_dev(div11, t55);
    			append_dev(div11, div6);
    			append_dev(div6, div5);
    			append_dev(div5, p11);
    			append_dev(div5, t57);
    			append_dev(div5, input8);
    			append_dev(div5, t58);
    			append_dev(div5, p12);
    			append_dev(div5, t60);
    			append_dev(div5, input9);
    			append_dev(div5, t61);
    			append_dev(div5, p13);
    			append_dev(div5, t63);
    			append_dev(div5, input10);
    			append_dev(div11, t64);
    			append_dev(div11, button4);
    			append_dev(div11, t66);
    			append_dev(div11, div8);
    			append_dev(div8, div7);
    			append_dev(div7, p14);
    			append_dev(div7, t68);
    			append_dev(div7, input11);
    			append_dev(div7, t69);
    			append_dev(div7, p15);
    			append_dev(div7, t71);
    			append_dev(div7, input12);
    			append_dev(div7, t72);
    			append_dev(div7, p16);
    			append_dev(div7, t74);
    			append_dev(div7, input13);
    			append_dev(div11, t75);
    			append_dev(div11, button5);
    			append_dev(div11, t77);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, p17);
    			append_dev(div9, t79);
    			append_dev(div9, input14);
    			append_dev(div9, t80);
    			append_dev(div9, p18);
    			append_dev(div9, t82);
    			append_dev(div9, input15);
    			append_dev(div9, t83);
    			append_dev(div9, p19);
    			append_dev(div9, t85);
    			append_dev(div9, input16);
    			append_dev(div14, t86);
    			append_dev(div14, div13);
    			append_dev(div13, button6);
    			append_dev(div13, t88);
    			append_dev(div13, button7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen_dev(button7, "click", /*save_changes*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*mode*/ 4 && button0_class_value !== (button0_class_value = "settings " + /*mode*/ ctx[2] + " svelte-kmimw")) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (dirty & /*blur_amount*/ 2) {
    				set_style(button0, "backdrop-filter", "blur(" + /*blur_amount*/ ctx[1] + ")");
    			}

    			if (dirty & /*background_image*/ 1 && input0.value !== /*background_image*/ ctx[0]) {
    				set_input_value(input0, /*background_image*/ ctx[0]);
    			}

    			if (dirty & /*blur_amount*/ 2 && input1.value !== /*blur_amount*/ ctx[1]) {
    				prop_dev(input1, "value", /*blur_amount*/ ctx[1]);
    			}

    			if (dirty & /*favourites*/ 8 && input2_value_value !== (input2_value_value = /*favourites*/ ctx[3][0].name) && input2.value !== input2_value_value) {
    				prop_dev(input2, "value", input2_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input3_value_value !== (input3_value_value = /*favourites*/ ctx[3][0].svg) && input3.value !== input3_value_value) {
    				prop_dev(input3, "value", input3_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input4_value_value !== (input4_value_value = /*favourites*/ ctx[3][0].href) && input4.value !== input4_value_value) {
    				prop_dev(input4, "value", input4_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input5_value_value !== (input5_value_value = /*favourites*/ ctx[3][1].name) && input5.value !== input5_value_value) {
    				prop_dev(input5, "value", input5_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input6_value_value !== (input6_value_value = /*favourites*/ ctx[3][1].svg) && input6.value !== input6_value_value) {
    				prop_dev(input6, "value", input6_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input7_value_value !== (input7_value_value = /*favourites*/ ctx[3][1].href) && input7.value !== input7_value_value) {
    				prop_dev(input7, "value", input7_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input8_value_value !== (input8_value_value = /*favourites*/ ctx[3][2].name) && input8.value !== input8_value_value) {
    				prop_dev(input8, "value", input8_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input9_value_value !== (input9_value_value = /*favourites*/ ctx[3][2].svg) && input9.value !== input9_value_value) {
    				prop_dev(input9, "value", input9_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input10_value_value !== (input10_value_value = /*favourites*/ ctx[3][2].href) && input10.value !== input10_value_value) {
    				prop_dev(input10, "value", input10_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input11_value_value !== (input11_value_value = /*favourites*/ ctx[3][3].name) && input11.value !== input11_value_value) {
    				prop_dev(input11, "value", input11_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input12_value_value !== (input12_value_value = /*favourites*/ ctx[3][3].svg) && input12.value !== input12_value_value) {
    				prop_dev(input12, "value", input12_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input13_value_value !== (input13_value_value = /*favourites*/ ctx[3][3].href) && input13.value !== input13_value_value) {
    				prop_dev(input13, "value", input13_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input14_value_value !== (input14_value_value = /*favourites*/ ctx[3][4].name) && input14.value !== input14_value_value) {
    				prop_dev(input14, "value", input14_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input15_value_value !== (input15_value_value = /*favourites*/ ctx[3][4].svg) && input15.value !== input15_value_value) {
    				prop_dev(input15, "value", input15_value_value);
    			}

    			if (dirty & /*favourites*/ 8 && input16_value_value !== (input16_value_value = /*favourites*/ ctx[3][4].href) && input16.value !== input16_value_value) {
    				prop_dev(input16, "value", input16_value_value);
    			}

    			if (dirty & /*blur_amount*/ 2) {
    				set_style(div14, "backdrop-filter", "blur(" + /*blur_amount*/ ctx[1] + ")");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div17);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Settings", slots, []);
    	let background_image;
    	let blur_amount;
    	let mode;
    	let favourites;
    	let search_engine;

    	background_image_store.subscribe(value => {
    		$$invalidate(0, background_image = value);
    	});

    	blur_amount_store.subscribe(value => {
    		$$invalidate(1, blur_amount = value);
    	});

    	mode_store.subscribe(value => {
    		$$invalidate(2, mode = value);
    	});

    	favourites_store.subscribe(value => {
    		$$invalidate(3, favourites = value);
    	});

    	search_engine_store.subscribe(value => {
    		search_engine = value;
    	});

    	onMount(() => {
    		[...document.getElementsByClassName("mode-option")].forEach(option => {
    			if (option.value === mode) {
    				option.setAttribute("selected", "true");
    			}
    		});

    		[...document.getElementsByClassName("search-engine-option")].forEach(option => {
    			if (option.value === search_engine) {
    				option.setAttribute("selected", "true");
    			}
    		});
    	});

    	function save_changes() {
    		background_image_store.set(document.getElementById("background-image").value);
    		blur_amount_store.set(document.getElementById("blur-amount").value);
    		mode_store.set(document.getElementById("mode").value);
    		search_engine_store.set(document.getElementById("search-engine").value);

    		favourites_store.set([
    			{
    				name: document.getElementById("favourites-name-0").value,
    				svg: document.getElementById("favourites-svg-0").value,
    				href: document.getElementById("favourites-href-0").value,
    				is_first: true,
    				is_last: false
    			},
    			{
    				name: document.getElementById("favourites-name-1").value,
    				svg: document.getElementById("favourites-svg-1").value,
    				href: document.getElementById("favourites-href-1").value,
    				is_first: false,
    				is_last: false
    			},
    			{
    				name: document.getElementById("favourites-name-2").value,
    				svg: document.getElementById("favourites-svg-2").value,
    				href: document.getElementById("favourites-href-2").value,
    				is_first: false,
    				is_last: false
    			},
    			{
    				name: document.getElementById("favourites-name-3").value,
    				svg: document.getElementById("favourites-svg-3").value,
    				href: document.getElementById("favourites-href-3").value,
    				is_first: false,
    				is_last: false
    			},
    			{
    				name: document.getElementById("favourites-name-4").value,
    				svg: document.getElementById("favourites-svg-4").value,
    				href: document.getElementById("favourites-href-4").value,
    				is_first: false,
    				is_last: true
    			}
    		]);

    		window.location.reload();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		background_image = this.value;
    		$$invalidate(0, background_image);
    	}

    	$$self.$capture_state = () => ({
    		background_image_store,
    		mode_store,
    		blur_amount_store,
    		favourites_store,
    		search_engine_store,
    		onMount,
    		background_image,
    		blur_amount,
    		mode,
    		favourites,
    		search_engine,
    		save_changes
    	});

    	$$self.$inject_state = $$props => {
    		if ("background_image" in $$props) $$invalidate(0, background_image = $$props.background_image);
    		if ("blur_amount" in $$props) $$invalidate(1, blur_amount = $$props.blur_amount);
    		if ("mode" in $$props) $$invalidate(2, mode = $$props.mode);
    		if ("favourites" in $$props) $$invalidate(3, favourites = $$props.favourites);
    		if ("search_engine" in $$props) search_engine = $$props.search_engine;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		background_image,
    		blur_amount,
    		mode,
    		favourites,
    		save_changes,
    		input0_input_handler
    	];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.29.7 */

    const { document: document_1 } = globals;
    const file$3 = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (237:4) {#each favourites as favourite}
    function create_each_block(ctx) {
    	let favourite;
    	let current;

    	favourite = new Favourite({
    			props: {
    				name: /*favourite*/ ctx[6].name,
    				svg: /*favourite*/ ctx[6].svg,
    				href: /*favourite*/ ctx[6].href,
    				is_first: /*favourite*/ ctx[6].is_first,
    				is_last: /*favourite*/ ctx[6].is_last,
    				full_object: /*favourite*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(favourite.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(favourite, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const favourite_changes = {};
    			if (dirty & /*favourites*/ 1) favourite_changes.name = /*favourite*/ ctx[6].name;
    			if (dirty & /*favourites*/ 1) favourite_changes.svg = /*favourite*/ ctx[6].svg;
    			if (dirty & /*favourites*/ 1) favourite_changes.href = /*favourite*/ ctx[6].href;
    			if (dirty & /*favourites*/ 1) favourite_changes.is_first = /*favourite*/ ctx[6].is_first;
    			if (dirty & /*favourites*/ 1) favourite_changes.is_last = /*favourite*/ ctx[6].is_last;
    			if (dirty & /*favourites*/ 1) favourite_changes.full_object = /*favourite*/ ctx[6];
    			favourite.$set(favourite_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(favourite.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(favourite.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(favourite, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(237:4) {#each favourites as favourite}",
    		ctx
    	});

    	return block;
    }

    // (236:3) <Container class="favourites-container">
    function create_default_slot_2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*favourites*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*favourites*/ 1) {
    				each_value = /*favourites*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(236:3) <Container class=\\\"favourites-container\\\">",
    		ctx
    	});

    	return block;
    }

    // (225:2) <Container>
    function create_default_slot_1(ctx) {
    	let form;
    	let input;
    	let input_class_value;
    	let input_placeholder_value;
    	let t;
    	let container;
    	let current;

    	container = new Container({
    			props: {
    				class: "favourites-container",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			input = element("input");
    			t = space();
    			create_component(container.$$.fragment);
    			set_style(input, "backdrop-filter", "blur(" + /*blur_amount*/ ctx[2] + ")");
    			attr_dev(input, "class", input_class_value = "mr-sm-2 " + /*mode*/ ctx[3] + " svelte-1ojsdv6");
    			attr_dev(input, "type", "search");
    			attr_dev(input, "placeholder", input_placeholder_value = "Search with " + /*search_engine*/ ctx[4]);
    			attr_dev(input, "aria-label", "Search");
    			attr_dev(input, "id", "search-bar");
    			attr_dev(input, "autocomplete", "off");
    			add_location(input, file$3, 226, 4, 4906);
    			attr_dev(form, "class", "form active-highlight");
    			attr_dev(form, "id", "search-form");
    			add_location(form, file$3, 225, 3, 4848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, input);
    			insert_dev(target, t, anchor);
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*blur_amount*/ 4) {
    				set_style(input, "backdrop-filter", "blur(" + /*blur_amount*/ ctx[2] + ")");
    			}

    			if (!current || dirty & /*mode*/ 8 && input_class_value !== (input_class_value = "mr-sm-2 " + /*mode*/ ctx[3] + " svelte-1ojsdv6")) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (!current || dirty & /*search_engine*/ 16 && input_placeholder_value !== (input_placeholder_value = "Search with " + /*search_engine*/ ctx[4])) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			const container_changes = {};

    			if (dirty & /*$$scope, favourites*/ 513) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t);
    			destroy_component(container, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(225:2) <Container>",
    		ctx
    	});

    	return block;
    }

    // (223:1) <Container   class="d-flex flex-row justify-content-center align-items-center w-100 h-100">
    function create_default_slot(ctx) {
    	let container;
    	let t;
    	let settings;
    	let current;

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	settings = new Settings({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(container.$$.fragment);
    			t = space();
    			create_component(settings.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(container, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(settings, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const container_changes = {};

    			if (dirty & /*$$scope, favourites, blur_amount, mode, search_engine*/ 541) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			transition_in(settings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			transition_out(settings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(container, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(settings, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(223:1) <Container   class=\\\"d-flex flex-row justify-content-center align-items-center w-100 h-100\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let link;
    	let t;
    	let main;
    	let container;
    	let current;

    	container = new Container({
    			props: {
    				class: "d-flex flex-row justify-content-center align-items-center w-100 h-100",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			main = element("main");
    			create_component(container.$$.fragment);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css");
    			add_location(link, file$3, 216, 1, 4555);
    			set_style(main, "background-image", "url(" + /*background_image*/ ctx[1] + ")");
    			attr_dev(main, "class", "svelte-1ojsdv6");
    			add_location(main, file$3, 221, 0, 4681);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, link);
    			insert_dev(target, t, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(container, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const container_changes = {};

    			if (dirty & /*$$scope, favourites, blur_amount, mode, search_engine*/ 541) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);

    			if (!current || dirty & /*background_image*/ 2) {
    				set_style(main, "background-image", "url(" + /*background_image*/ ctx[1] + ")");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(main);
    			destroy_component(container);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function lowercase$1(x) {
    	x = x.toLowerCase().split(" ").join("-");
    	return x;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { background_image } = $$props;
    	let { blur_amount } = $$props;
    	let { mode } = $$props;
    	let { favourites } = $$props;
    	let { search_engine } = $$props;
    	let { tld_list } = $$props;

    	onMount(() => {
    		document.getElementsByClassName("active-highlight")[0].addEventListener("submit", e => {
    			e.preventDefault();
    			let is_url = false;

    			tld_list.forEach(tld => {
    				if (document.getElementById("search-bar").value.endsWith("." + tld) && !document.getElementById("search-bar").value.includes(" ") && !document.getElementById("search-bar").value.startsWith(".")) {
    					window.location.replace("http://" + document.getElementById("search-bar").value);
    					is_url = true;
    				}
    			});

    			if (!is_url) {
    				if (document.getElementById("search-bar").value.startsWith("!")) {
    					window.location.replace(encodeURI("https://duckduckgo.com/?q=" + document.getElementById("search-bar").value));
    				} else {
    					window.location.replace(encodeURI("https://duckduckgo.com/?q=" + "!" + lowercase$1(search_engine) + " " + document.getElementById("search-bar").value));
    				}
    			}
    		});

    		let dragging, dragged_over;

    		const initialise_drag = array => {
    			$$invalidate(0, favourites = array.slice());
    		};

    		const compare = e => {
    			[...document.getElementsByClassName("favourite")].forEach(node => {
    				node.style.border = "none";
    			});

    			try {
    				let index1 = favourites.findIndex((item, i) => {
    					return item.name === dragging.name;
    				});

    				let index2 = favourites.findIndex((item, i) => {
    					return item.name === JSON.parse(dragged_over.getAttribute("full-object")).name;
    				});

    				favourites.splice(index1, 1);
    				favourites.splice(index2, 0, dragging);

    				favourites.forEach((value, i) => {
    					if (i === 0) {
    						value.is_first = true;
    					} else {
    						value.is_first = false;
    					}

    					if (i === favourites.length - 1) {
    						value.is_last = true;
    					} else {
    						value.is_last = false;
    					}
    				});

    				$$invalidate(0, favourites);
    				favourites_store.set(favourites);
    			} catch {
    				
    			}
    		};

    		const set_dragged_over = e => {
    			e.preventDefault();
    			dragged_over = e.target;

    			if (JSON.parse(dragged_over.getAttribute("full-object")) === null) {
    				[...document.getElementsByClassName("favourite")].forEach(node => {
    					node.style.border = "none";
    				});
    			}

    			try {
    				favourites.findIndex((item, i) => {
    					if (item.name === JSON.parse(dragged_over.getAttribute("full-object")).name) {
    						[...document.getElementsByClassName("favourite")].forEach(node => {
    							node.style.border = "none";
    						});

    						dragged_over.style.border = "1px solid #ffffff40";
    					}
    				});
    			} catch {
    				
    			}
    		};

    		const set_dragging = e => {
    			dragging = JSON.parse(e.target.getAttribute("full-object"));
    		};

    		initialise_drag(favourites);

    		[...document.getElementsByClassName("favourite")].forEach(node => {
    			node.addEventListener("dragstart", set_dragging);
    			node.addEventListener("dragover", set_dragged_over);
    			node.addEventListener("drop", compare);
    		});
    	});

    	const writable_props = [
    		"background_image",
    		"blur_amount",
    		"mode",
    		"favourites",
    		"search_engine",
    		"tld_list"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("background_image" in $$props) $$invalidate(1, background_image = $$props.background_image);
    		if ("blur_amount" in $$props) $$invalidate(2, blur_amount = $$props.blur_amount);
    		if ("mode" in $$props) $$invalidate(3, mode = $$props.mode);
    		if ("favourites" in $$props) $$invalidate(0, favourites = $$props.favourites);
    		if ("search_engine" in $$props) $$invalidate(4, search_engine = $$props.search_engine);
    		if ("tld_list" in $$props) $$invalidate(5, tld_list = $$props.tld_list);
    	};

    	$$self.$capture_state = () => ({
    		favourites_store,
    		Container,
    		onMount,
    		Favourite,
    		Settings,
    		background_image,
    		blur_amount,
    		mode,
    		favourites,
    		search_engine,
    		tld_list,
    		lowercase: lowercase$1
    	});

    	$$self.$inject_state = $$props => {
    		if ("background_image" in $$props) $$invalidate(1, background_image = $$props.background_image);
    		if ("blur_amount" in $$props) $$invalidate(2, blur_amount = $$props.blur_amount);
    		if ("mode" in $$props) $$invalidate(3, mode = $$props.mode);
    		if ("favourites" in $$props) $$invalidate(0, favourites = $$props.favourites);
    		if ("search_engine" in $$props) $$invalidate(4, search_engine = $$props.search_engine);
    		if ("tld_list" in $$props) $$invalidate(5, tld_list = $$props.tld_list);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [favourites, background_image, blur_amount, mode, search_engine, tld_list];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			background_image: 1,
    			blur_amount: 2,
    			mode: 3,
    			favourites: 0,
    			search_engine: 4,
    			tld_list: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*background_image*/ ctx[1] === undefined && !("background_image" in props)) {
    			console.warn("<App> was created without expected prop 'background_image'");
    		}

    		if (/*blur_amount*/ ctx[2] === undefined && !("blur_amount" in props)) {
    			console.warn("<App> was created without expected prop 'blur_amount'");
    		}

    		if (/*mode*/ ctx[3] === undefined && !("mode" in props)) {
    			console.warn("<App> was created without expected prop 'mode'");
    		}

    		if (/*favourites*/ ctx[0] === undefined && !("favourites" in props)) {
    			console.warn("<App> was created without expected prop 'favourites'");
    		}

    		if (/*search_engine*/ ctx[4] === undefined && !("search_engine" in props)) {
    			console.warn("<App> was created without expected prop 'search_engine'");
    		}

    		if (/*tld_list*/ ctx[5] === undefined && !("tld_list" in props)) {
    			console.warn("<App> was created without expected prop 'tld_list'");
    		}
    	}

    	get background_image() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set background_image(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get blur_amount() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set blur_amount(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mode() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mode(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get favourites() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set favourites(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get search_engine() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set search_engine(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tld_list() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tld_list(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let background_image;
    let blur_amount;
    let mode;
    let favourites;
    let search_engine;

    background_image_store.subscribe(value => {
    	background_image = value;
    });

    blur_amount_store.subscribe(value => {
    	blur_amount = value;
    });

    mode_store.subscribe(value => {
    	mode = value;
    });

    favourites_store.subscribe(value => {
    	favourites = value;
    });

    search_engine_store.subscribe(value => {
    	search_engine = value;
    });

    const app = new App({
    	target: document.body,
    	props: {
    		background_image: background_image,
    		blur_amount: blur_amount,
    		mode: mode,
    		favourites: favourites,
    		search_engine: search_engine,
    		tld_list: [
    			'aaa',
    			'aarp',
    			'abarth',
    			'abb',
    			'abbott',
    			'abbvie',
    			'abc',
    			'able',
    			'abogado',
    			'abudhabi',
    			'ac',
    			'academy',
    			'accenture',
    			'accountant',
    			'accountants',
    			'aco',
    			'actor',
    			'ad',
    			'adac',
    			'ads',
    			'adult',
    			'ae',
    			'aeg',
    			'aero',
    			'aetna',
    			'af',
    			'afamilycompany',
    			'afl',
    			'africa',
    			'ag',
    			'agakhan',
    			'agency',
    			'ai',
    			'aig',
    			'airbus',
    			'airforce',
    			'airtel',
    			'akdn',
    			'al',
    			'alfaromeo',
    			'alibaba',
    			'alipay',
    			'allfinanz',
    			'allstate',
    			'ally',
    			'alsace',
    			'alstom',
    			'am',
    			'amazon',
    			'americanexpress',
    			'americanfamily',
    			'amex',
    			'amfam',
    			'amica',
    			'amsterdam',
    			'analytics',
    			'android',
    			'anquan',
    			'anz',
    			'ao',
    			'aol',
    			'apartments',
    			'app',
    			'apple',
    			'aq',
    			'aquarelle',
    			'ar',
    			'arab',
    			'aramco',
    			'archi',
    			'army',
    			'arpa',
    			'art',
    			'arte',
    			'as',
    			'asda',
    			'asia',
    			'associates',
    			'at',
    			'athleta',
    			'attorney',
    			'au',
    			'auction',
    			'audi',
    			'audible',
    			'audio',
    			'auspost',
    			'author',
    			'auto',
    			'autos',
    			'avianca',
    			'aw',
    			'aws',
    			'ax',
    			'axa',
    			'az',
    			'azure',
    			'ba',
    			'baby',
    			'baidu',
    			'banamex',
    			'bananarepublic',
    			'band',
    			'bank',
    			'bar',
    			'barcelona',
    			'barclaycard',
    			'barclays',
    			'barefoot',
    			'bargains',
    			'baseball',
    			'basketball',
    			'bauhaus',
    			'bayern',
    			'bb',
    			'bbc',
    			'bbt',
    			'bbva',
    			'bcg',
    			'bcn',
    			'bd',
    			'be',
    			'beats',
    			'beauty',
    			'beer',
    			'bentley',
    			'berlin',
    			'best',
    			'bestbuy',
    			'bet',
    			'bf',
    			'bg',
    			'bh',
    			'bharti',
    			'bi',
    			'bible',
    			'bid',
    			'bike',
    			'bing',
    			'bingo',
    			'bio',
    			'biz',
    			'bj',
    			'black',
    			'blackfriday',
    			'blockbuster',
    			'blog',
    			'bloomberg',
    			'blue',
    			'bm',
    			'bms',
    			'bmw',
    			'bn',
    			'bnpparibas',
    			'bo',
    			'boats',
    			'boehringer',
    			'bofa',
    			'bom',
    			'bond',
    			'boo',
    			'book',
    			'booking',
    			'bosch',
    			'bostik',
    			'boston',
    			'bot',
    			'boutique',
    			'box',
    			'br',
    			'bradesco',
    			'bridgestone',
    			'broadway',
    			'broker',
    			'brother',
    			'brussels',
    			'bs',
    			'bt',
    			'budapest',
    			'bugatti',
    			'build',
    			'builders',
    			'business',
    			'buy',
    			'buzz',
    			'bv',
    			'bw',
    			'by',
    			'bz',
    			'bzh',
    			'ca',
    			'cab',
    			'cafe',
    			'cal',
    			'call',
    			'calvinklein',
    			'cam',
    			'camera',
    			'camp',
    			'cancerresearch',
    			'canon',
    			'capetown',
    			'capital',
    			'capitalone',
    			'car',
    			'caravan',
    			'cards',
    			'care',
    			'career',
    			'careers',
    			'cars',
    			'casa',
    			'case',
    			'caseih',
    			'cash',
    			'casino',
    			'cat',
    			'catering',
    			'catholic',
    			'cba',
    			'cbn',
    			'cbre',
    			'cbs',
    			'cc',
    			'cd',
    			'ceb',
    			'center',
    			'ceo',
    			'cern',
    			'cf',
    			'cfa',
    			'cfd',
    			'cg',
    			'ch',
    			'chanel',
    			'channel',
    			'charity',
    			'chase',
    			'chat',
    			'cheap',
    			'chintai',
    			'christmas',
    			'chrome',
    			'church',
    			'ci',
    			'cipriani',
    			'circle',
    			'cisco',
    			'citadel',
    			'citi',
    			'citic',
    			'city',
    			'cityeats',
    			'ck',
    			'cl',
    			'claims',
    			'cleaning',
    			'click',
    			'clinic',
    			'clinique',
    			'clothing',
    			'cloud',
    			'club',
    			'clubmed',
    			'cm',
    			'cn',
    			'co',
    			'coach',
    			'codes',
    			'coffee',
    			'college',
    			'cologne',
    			'com',
    			'comcast',
    			'commbank',
    			'community',
    			'company',
    			'compare',
    			'computer',
    			'comsec',
    			'condos',
    			'construction',
    			'consulting',
    			'contact',
    			'contractors',
    			'cooking',
    			'cookingchannel',
    			'cool',
    			'coop',
    			'corsica',
    			'country',
    			'coupon',
    			'coupons',
    			'courses',
    			'cpa',
    			'cr',
    			'credit',
    			'creditcard',
    			'creditunion',
    			'cricket',
    			'crown',
    			'crs',
    			'cruise',
    			'cruises',
    			'csc',
    			'cu',
    			'cuisinella',
    			'cv',
    			'cw',
    			'cx',
    			'cy',
    			'cymru',
    			'cyou',
    			'cz',
    			'dabur',
    			'dad',
    			'dance',
    			'data',
    			'date',
    			'dating',
    			'datsun',
    			'day',
    			'dclk',
    			'dds',
    			'de',
    			'deal',
    			'dealer',
    			'deals',
    			'degree',
    			'delivery',
    			'dell',
    			'deloitte',
    			'delta',
    			'democrat',
    			'dental',
    			'dentist',
    			'desi',
    			'design',
    			'dev',
    			'dhl',
    			'diamonds',
    			'diet',
    			'digital',
    			'direct',
    			'directory',
    			'discount',
    			'discover',
    			'dish',
    			'diy',
    			'dj',
    			'dk',
    			'dm',
    			'dnp',
    			'do',
    			'docs',
    			'doctor',
    			'dog',
    			'domains',
    			'dot',
    			'download',
    			'drive',
    			'dtv',
    			'dubai',
    			'duck',
    			'dunlop',
    			'dupont',
    			'durban',
    			'dvag',
    			'dvr',
    			'dz',
    			'earth',
    			'eat',
    			'ec',
    			'eco',
    			'edeka',
    			'edu',
    			'education',
    			'ee',
    			'eg',
    			'email',
    			'emerck',
    			'energy',
    			'engineer',
    			'engineering',
    			'enterprises',
    			'epson',
    			'equipment',
    			'er',
    			'ericsson',
    			'erni',
    			'es',
    			'esq',
    			'estate',
    			'et',
    			'etisalat',
    			'eu',
    			'eurovision',
    			'eus',
    			'events',
    			'exchange',
    			'expert',
    			'exposed',
    			'express',
    			'extraspace',
    			'fage',
    			'fail',
    			'fairwinds',
    			'faith',
    			'family',
    			'fan',
    			'fans',
    			'farm',
    			'farmers',
    			'fashion',
    			'fast',
    			'fedex',
    			'feedback',
    			'ferrari',
    			'ferrero',
    			'fi',
    			'fiat',
    			'fidelity',
    			'fido',
    			'film',
    			'final',
    			'finance',
    			'financial',
    			'fire',
    			'firestone',
    			'firmdale',
    			'fish',
    			'fishing',
    			'fit',
    			'fitness',
    			'fj',
    			'fk',
    			'flickr',
    			'flights',
    			'flir',
    			'florist',
    			'flowers',
    			'fly',
    			'fm',
    			'fo',
    			'foo',
    			'food',
    			'foodnetwork',
    			'football',
    			'ford',
    			'forex',
    			'forsale',
    			'forum',
    			'foundation',
    			'fox',
    			'fr',
    			'free',
    			'fresenius',
    			'frl',
    			'frogans',
    			'frontdoor',
    			'frontier',
    			'ftr',
    			'fujitsu',
    			'fujixerox',
    			'fun',
    			'fund',
    			'furniture',
    			'futbol',
    			'fyi',
    			'ga',
    			'gal',
    			'gallery',
    			'gallo',
    			'gallup',
    			'game',
    			'games',
    			'gap',
    			'garden',
    			'gay',
    			'gb',
    			'gbiz',
    			'gd',
    			'gdn',
    			'ge',
    			'gea',
    			'gent',
    			'genting',
    			'george',
    			'gf',
    			'gg',
    			'ggee',
    			'gh',
    			'gi',
    			'gift',
    			'gifts',
    			'gives',
    			'giving',
    			'gl',
    			'glade',
    			'glass',
    			'gle',
    			'global',
    			'globo',
    			'gm',
    			'gmail',
    			'gmbh',
    			'gmo',
    			'gmx',
    			'gn',
    			'godaddy',
    			'gold',
    			'goldpoint',
    			'golf',
    			'goo',
    			'goodyear',
    			'goog',
    			'google',
    			'gop',
    			'got',
    			'gov',
    			'gp',
    			'gq',
    			'gr',
    			'grainger',
    			'graphics',
    			'gratis',
    			'green',
    			'gripe',
    			'grocery',
    			'group',
    			'gs',
    			'gt',
    			'gu',
    			'guardian',
    			'gucci',
    			'guge',
    			'guide',
    			'guitars',
    			'guru',
    			'gw',
    			'gy',
    			'hair',
    			'hamburg',
    			'hangout',
    			'haus',
    			'hbo',
    			'hdfc',
    			'hdfcbank',
    			'health',
    			'healthcare',
    			'help',
    			'helsinki',
    			'here',
    			'hermes',
    			'hgtv',
    			'hiphop',
    			'hisamitsu',
    			'hitachi',
    			'hiv',
    			'hk',
    			'hkt',
    			'hm',
    			'hn',
    			'hockey',
    			'holdings',
    			'holiday',
    			'homedepot',
    			'homegoods',
    			'homes',
    			'homesense',
    			'honda',
    			'horse',
    			'hospital',
    			'host',
    			'hosting',
    			'hot',
    			'hoteles',
    			'hotels',
    			'hotmail',
    			'house',
    			'how',
    			'hr',
    			'hsbc',
    			'ht',
    			'hu',
    			'hughes',
    			'hyatt',
    			'hyundai',
    			'ibm',
    			'icbc',
    			'ice',
    			'icu',
    			'id',
    			'ie',
    			'ieee',
    			'ifm',
    			'ikano',
    			'il',
    			'im',
    			'imamat',
    			'imdb',
    			'immo',
    			'immobilien',
    			'in',
    			'inc',
    			'industries',
    			'infiniti',
    			'info',
    			'ing',
    			'ink',
    			'institute',
    			'insurance',
    			'insure',
    			'int',
    			'international',
    			'intuit',
    			'investments',
    			'io',
    			'ipiranga',
    			'iq',
    			'ir',
    			'irish',
    			'is',
    			'ismaili',
    			'ist',
    			'istanbul',
    			'it',
    			'itau',
    			'itv',
    			'iveco',
    			'jaguar',
    			'java',
    			'jcb',
    			'jcp',
    			'je',
    			'jeep',
    			'jetzt',
    			'jewelry',
    			'jio',
    			'jll',
    			'jm',
    			'jmp',
    			'jnj',
    			'jo',
    			'jobs',
    			'joburg',
    			'jot',
    			'joy',
    			'jp',
    			'jpmorgan',
    			'jprs',
    			'juegos',
    			'juniper',
    			'kaufen',
    			'kddi',
    			'ke',
    			'kerryhotels',
    			'kerrylogistics',
    			'kerryproperties',
    			'kfh',
    			'kg',
    			'kh',
    			'ki',
    			'kia',
    			'kim',
    			'kinder',
    			'kindle',
    			'kitchen',
    			'kiwi',
    			'km',
    			'kn',
    			'koeln',
    			'komatsu',
    			'kosher',
    			'kp',
    			'kpmg',
    			'kpn',
    			'kr',
    			'krd',
    			'kred',
    			'kuokgroup',
    			'kw',
    			'ky',
    			'kyoto',
    			'kz',
    			'la',
    			'lacaixa',
    			'lamborghini',
    			'lamer',
    			'lancaster',
    			'lancia',
    			'land',
    			'landrover',
    			'lanxess',
    			'lasalle',
    			'lat',
    			'latino',
    			'latrobe',
    			'law',
    			'lawyer',
    			'lb',
    			'lc',
    			'lds',
    			'lease',
    			'leclerc',
    			'lefrak',
    			'legal',
    			'lego',
    			'lexus',
    			'lgbt',
    			'li',
    			'lidl',
    			'life',
    			'lifeinsurance',
    			'lifestyle',
    			'lighting',
    			'like',
    			'lilly',
    			'limited',
    			'limo',
    			'lincoln',
    			'linde',
    			'link',
    			'lipsy',
    			'live',
    			'living',
    			'lixil',
    			'lk',
    			'llc',
    			'llp',
    			'loan',
    			'loans',
    			'locker',
    			'locus',
    			'loft',
    			'lol',
    			'london',
    			'lotte',
    			'lotto',
    			'love',
    			'lpl',
    			'lplfinancial',
    			'lr',
    			'ls',
    			'lt',
    			'ltd',
    			'ltda',
    			'lu',
    			'lundbeck',
    			'lupin',
    			'luxe',
    			'luxury',
    			'lv',
    			'ly',
    			'ma',
    			'macys',
    			'madrid',
    			'maif',
    			'maison',
    			'makeup',
    			'man',
    			'management',
    			'mango',
    			'map',
    			'market',
    			'marketing',
    			'markets',
    			'marriott',
    			'marshalls',
    			'maserati',
    			'mattel',
    			'mba',
    			'mc',
    			'mckinsey',
    			'md',
    			'me',
    			'med',
    			'media',
    			'meet',
    			'melbourne',
    			'meme',
    			'memorial',
    			'men',
    			'menu',
    			'merckmsd',
    			'mg',
    			'mh',
    			'miami',
    			'microsoft',
    			'mil',
    			'mini',
    			'mint',
    			'mit',
    			'mitsubishi',
    			'mk',
    			'ml',
    			'mlb',
    			'mls',
    			'mm',
    			'mma',
    			'mn',
    			'mo',
    			'mobi',
    			'mobile',
    			'moda',
    			'moe',
    			'moi',
    			'mom',
    			'monash',
    			'money',
    			'monster',
    			'mormon',
    			'mortgage',
    			'moscow',
    			'moto',
    			'motorcycles',
    			'mov',
    			'movie',
    			'mp',
    			'mq',
    			'mr',
    			'ms',
    			'msd',
    			'mt',
    			'mtn',
    			'mtr',
    			'mu',
    			'museum',
    			'mutual',
    			'mv',
    			'mw',
    			'mx',
    			'my',
    			'mz',
    			'na',
    			'nab',
    			'nagoya',
    			'name',
    			'nationwide',
    			'natura',
    			'navy',
    			'nba',
    			'nc',
    			'ne',
    			'nec',
    			'net',
    			'netbank',
    			'netflix',
    			'network',
    			'neustar',
    			'new',
    			'newholland',
    			'news',
    			'next',
    			'nextdirect',
    			'nexus',
    			'nf',
    			'nfl',
    			'ng',
    			'ngo',
    			'nhk',
    			'ni',
    			'nico',
    			'nike',
    			'nikon',
    			'ninja',
    			'nissan',
    			'nissay',
    			'nl',
    			'no',
    			'nokia',
    			'northwesternmutual',
    			'norton',
    			'now',
    			'nowruz',
    			'nowtv',
    			'np',
    			'nr',
    			'nra',
    			'nrw',
    			'ntt',
    			'nu',
    			'nyc',
    			'nz',
    			'obi',
    			'observer',
    			'off',
    			'office',
    			'okinawa',
    			'olayan',
    			'olayangroup',
    			'oldnavy',
    			'ollo',
    			'om',
    			'omega',
    			'one',
    			'ong',
    			'onl',
    			'online',
    			'onyourside',
    			'ooo',
    			'open',
    			'oracle',
    			'orange',
    			'org',
    			'organic',
    			'origins',
    			'osaka',
    			'otsuka',
    			'ott',
    			'ovh',
    			'pa',
    			'page',
    			'panasonic',
    			'paris',
    			'pars',
    			'partners',
    			'parts',
    			'party',
    			'passagens',
    			'pay',
    			'pccw',
    			'pe',
    			'pet',
    			'pf',
    			'pfizer',
    			'pg',
    			'ph',
    			'pharmacy',
    			'phd',
    			'philips',
    			'phone',
    			'photo',
    			'photography',
    			'photos',
    			'physio',
    			'pics',
    			'pictet',
    			'pictures',
    			'pid',
    			'pin',
    			'ping',
    			'pink',
    			'pioneer',
    			'pizza',
    			'pk',
    			'pl',
    			'place',
    			'play',
    			'playstation',
    			'plumbing',
    			'plus',
    			'pm',
    			'pn',
    			'pnc',
    			'pohl',
    			'poker',
    			'politie',
    			'porn',
    			'post',
    			'pr',
    			'pramerica',
    			'praxi',
    			'press',
    			'prime',
    			'pro',
    			'prod',
    			'productions',
    			'prof',
    			'progressive',
    			'promo',
    			'properties',
    			'property',
    			'protection',
    			'pru',
    			'prudential',
    			'ps',
    			'pt',
    			'pub',
    			'pw',
    			'pwc',
    			'py',
    			'qa',
    			'qpon',
    			'quebec',
    			'quest',
    			'qvc',
    			'racing',
    			'radio',
    			'raid',
    			're',
    			'read',
    			'realestate',
    			'realtor',
    			'realty',
    			'recipes',
    			'red',
    			'redstone',
    			'redumbrella',
    			'rehab',
    			'reise',
    			'reisen',
    			'reit',
    			'reliance',
    			'ren',
    			'rent',
    			'rentals',
    			'repair',
    			'report',
    			'republican',
    			'rest',
    			'restaurant',
    			'review',
    			'reviews',
    			'rexroth',
    			'rich',
    			'richardli',
    			'ricoh',
    			'ril',
    			'rio',
    			'rip',
    			'rmit',
    			'ro',
    			'rocher',
    			'rocks',
    			'rodeo',
    			'rogers',
    			'room',
    			'rs',
    			'rsvp',
    			'ru',
    			'rugby',
    			'ruhr',
    			'run',
    			'rw',
    			'rwe',
    			'ryukyu',
    			'sa',
    			'saarland',
    			'safe',
    			'safety',
    			'sakura',
    			'sale',
    			'salon',
    			'samsclub',
    			'samsung',
    			'sandvik',
    			'sandvikcoromant',
    			'sanofi',
    			'sap',
    			'sarl',
    			'sas',
    			'save',
    			'saxo',
    			'sb',
    			'sbi',
    			'sbs',
    			'sc',
    			'sca',
    			'scb',
    			'schaeffler',
    			'schmidt',
    			'scholarships',
    			'school',
    			'schule',
    			'schwarz',
    			'science',
    			'scjohnson',
    			'scot',
    			'sd',
    			'se',
    			'search',
    			'seat',
    			'secure',
    			'security',
    			'seek',
    			'select',
    			'sener',
    			'services',
    			'ses',
    			'seven',
    			'sew',
    			'sex',
    			'sexy',
    			'sfr',
    			'sg',
    			'sh',
    			'shangrila',
    			'sharp',
    			'shaw',
    			'shell',
    			'shia',
    			'shiksha',
    			'shoes',
    			'shop',
    			'shopping',
    			'shouji',
    			'show',
    			'showtime',
    			'shriram',
    			'si',
    			'silk',
    			'sina',
    			'singles',
    			'site',
    			'sj',
    			'sk',
    			'ski',
    			'skin',
    			'sky',
    			'skype',
    			'sl',
    			'sling',
    			'sm',
    			'smart',
    			'smile',
    			'sn',
    			'sncf',
    			'so',
    			'soccer',
    			'social',
    			'softbank',
    			'software',
    			'sohu',
    			'solar',
    			'solutions',
    			'song',
    			'sony',
    			'soy',
    			'spa',
    			'space',
    			'sport',
    			'spot',
    			'spreadbetting',
    			'sr',
    			'srl',
    			'ss',
    			'st',
    			'stada',
    			'staples',
    			'star',
    			'statebank',
    			'statefarm',
    			'stc',
    			'stcgroup',
    			'stockholm',
    			'storage',
    			'store',
    			'stream',
    			'studio',
    			'study',
    			'style',
    			'su',
    			'sucks',
    			'supplies',
    			'supply',
    			'support',
    			'surf',
    			'surgery',
    			'suzuki',
    			'sv',
    			'swatch',
    			'swiftcover',
    			'swiss',
    			'sx',
    			'sy',
    			'sydney',
    			'systems',
    			'sz',
    			'tab',
    			'taipei',
    			'talk',
    			'taobao',
    			'target',
    			'tatamotors',
    			'tatar',
    			'tattoo',
    			'tax',
    			'taxi',
    			'tc',
    			'tci',
    			'td',
    			'tdk',
    			'team',
    			'tech',
    			'technology',
    			'tel',
    			'temasek',
    			'tennis',
    			'teva',
    			'tf',
    			'tg',
    			'th',
    			'thd',
    			'theater',
    			'theatre',
    			'tiaa',
    			'tickets',
    			'tienda',
    			'tiffany',
    			'tips',
    			'tires',
    			'tirol',
    			'tj',
    			'tjmaxx',
    			'tjx',
    			'tk',
    			'tkmaxx',
    			'tl',
    			'tm',
    			'tmall',
    			'tn',
    			'to',
    			'today',
    			'tokyo',
    			'tools',
    			'top',
    			'toray',
    			'toshiba',
    			'total',
    			'tours',
    			'town',
    			'toyota',
    			'toys',
    			'tr',
    			'trade',
    			'trading',
    			'training',
    			'travel',
    			'travelchannel',
    			'travelers',
    			'travelersinsurance',
    			'trust',
    			'trv',
    			'tt',
    			'tube',
    			'tui',
    			'tunes',
    			'tushu',
    			'tv',
    			'tvs',
    			'tw',
    			'tz',
    			'ua',
    			'ubank',
    			'ubs',
    			'ug',
    			'uk',
    			'unicom',
    			'university',
    			'uno',
    			'uol',
    			'ups',
    			'us',
    			'uy',
    			'uz',
    			'va',
    			'vacations',
    			'vana',
    			'vanguard',
    			'vc',
    			've',
    			'vegas',
    			'ventures',
    			'verisign',
    			'versicherung',
    			'vet',
    			'vg',
    			'vi',
    			'viajes',
    			'video',
    			'vig',
    			'viking',
    			'villas',
    			'vin',
    			'vip',
    			'virgin',
    			'visa',
    			'vision',
    			'viva',
    			'vivo',
    			'vlaanderen',
    			'vn',
    			'vodka',
    			'volkswagen',
    			'volvo',
    			'vote',
    			'voting',
    			'voto',
    			'voyage',
    			'vu',
    			'vuelos',
    			'wales',
    			'walmart',
    			'walter',
    			'wang',
    			'wanggou',
    			'watch',
    			'watches',
    			'weather',
    			'weatherchannel',
    			'webcam',
    			'weber',
    			'website',
    			'wed',
    			'wedding',
    			'weibo',
    			'weir',
    			'wf',
    			'whoswho',
    			'wien',
    			'wiki',
    			'williamhill',
    			'win',
    			'windows',
    			'wine',
    			'winners',
    			'wme',
    			'wolterskluwer',
    			'woodside',
    			'work',
    			'works',
    			'world',
    			'wow',
    			'ws',
    			'wtc',
    			'wtf',
    			'xbox',
    			'xerox',
    			'xfinity',
    			'xihuan',
    			'xin',
    			'xxx',
    			'xyz',
    			'yachts',
    			'yahoo',
    			'yamaxun',
    			'yandex',
    			'ye',
    			'yodobashi',
    			'yoga',
    			'yokohama',
    			'you',
    			'youtube',
    			'yt',
    			'yun',
    			'za',
    			'zappos',
    			'zara',
    			'zero',
    			'zip',
    			'zm',
    			'zone',
    			'zuerich',
    			'zw'
    		]
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
