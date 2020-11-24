<script>
    import { mode_store, blur_amount_store } from "../stores.js";

    export let name;
    export let svg;
    export let href;
    export let is_first;
    export let is_last;
    export let full_object;

    let blur_amount;
    let mode;

    blur_amount_store.subscribe((value) => {
        blur_amount = value;
    });

    mode_store.subscribe((value) => {
        mode = value;
    });

    function lowercase(x) {
        x = x.toLowerCase().split(" ").join("-");

        return x;
    }
</script>

<style>
    .favourite {
        width: 70px;
        height: 70px;
        background-color: rgba(0, 0, 0, 0.3);
        color: #ffffff;
        margin-right: 36.25px;
        outline: none;
        border: none;
        padding: 0 !important;
        box-shadow: 0px 16px 27px 0px rgba(0, 0, 0, 0.3);
    }

    .favourite:active,
    .favourite:hover {
        outline: none;
        border: none;
        background-color: rgba(0, 0, 0, 0.3);
    }

    .fluid {
        width: 110px;
        height: 110px;
        margin-right: 5px;
        border-radius: 0;
    }

    .material {
        border-radius: 3em;
    }

    .cupertino {
        border-radius: 0.7em;
    }

    @media (max-width: 768px) {
        .favourite {
            width: 50px;
            height: 50px;
            margin-right: 5px !important;
        }
    }

    .last,
    .last:active,
    .last:hover {
        margin-right: 0 !important;
    }
</style>

<button
    class="favourite {is_last ? 'last' : ''} {is_first ? 'first' : ''} {mode}"
    style="backdrop-filter: blur({blur_amount}); -webkit-backdrop-filter: blur({blur_amount});"
    id={lowercase(name)}
    onclick="window.location.href='{href}'"
    draggable="true"
    full-object={JSON.stringify(full_object)}>
    {@html svg}
</button>
