<script>
    import {
        background_image_store,
        mode_store,
        blur_amount_store,
        favourites_store,
        search_engine_store,
    } from "../stores.js";
    import { onMount } from "svelte";

    let background_image;
    let blur_amount;
    let mode;
    let favourites;
    let search_engine;

    background_image_store.subscribe((value) => {
        background_image = value;
    });

    blur_amount_store.subscribe((value) => {
        blur_amount = value;
    });

    mode_store.subscribe((value) => {
        mode = value;
    });

    favourites_store.subscribe((value) => {
        favourites = value;
    });

    search_engine_store.subscribe((value) => {
        search_engine = value;
    });

    onMount(() => {
        [...document.getElementsByClassName("mode-option")].forEach(
            (option) => {
                if (option.value === mode) {
                    option.setAttribute("selected", "true");
                }
            }
        );

        [...document.getElementsByClassName("search-engine-option")].forEach(
            (option) => {
                if (option.value === search_engine) {
                    option.setAttribute("selected", "true");
                }
            }
        );
    });

    function save_changes() {
        background_image_store.set(
            document.getElementById("background-image").value
        );

        blur_amount_store.set(document.getElementById("blur-amount").value);

        mode_store.set(document.getElementById("mode").value);

        search_engine_store.set(document.getElementById("search-engine").value);

        favourites_store.set([
            {
                name: document.getElementById("favourites-name-0").value,
                svg: document.getElementById("favourites-svg-0").value,
                href: document.getElementById("favourites-href-0").value,
                is_first: true,
                is_last: false,
            },
            {
                name: document.getElementById("favourites-name-1").value,
                svg: document.getElementById("favourites-svg-1").value,
                href: document.getElementById("favourites-href-1").value,
                is_first: false,
                is_last: false,
            },
            {
                name: document.getElementById("favourites-name-2").value,
                svg: document.getElementById("favourites-svg-2").value,
                href: document.getElementById("favourites-href-2").value,
                is_first: false,
                is_last: false,
            },
            {
                name: document.getElementById("favourites-name-3").value,
                svg: document.getElementById("favourites-svg-3").value,
                href: document.getElementById("favourites-href-3").value,
                is_first: false,
                is_last: false,
            },
            {
                name: document.getElementById("favourites-name-4").value,
                svg: document.getElementById("favourites-svg-4").value,
                href: document.getElementById("favourites-href-4").value,
                is_first: false,
                is_last: true,
            },
        ]);

        window.location.reload();
    }
</script>

<style>
    .settings {
        width: 55px;
        height: 55px;
        background-color: rgba(0, 0, 0, 0.3);
        color: #ffffff;
        outline: none;
        border: none;
        padding: 0 !important;
        box-shadow: 0px 16px 27px 0px rgba(0, 0, 0, 0.3);
        position: fixed;
        right: 20px;
        bottom: 20px;
    }

    .settings:active,
    .settings:hover {
        outline: none;
        border: none;
        background-color: rgba(0, 0, 0, 0.3);
    }

    .fluid {
        border-radius: 0;
    }

    .material {
        border-radius: 3em;
    }

    .cupertino {
        border-radius: 0.7em;
    }

    input[type="text"] {
        width: 100%;
    }

    .settings-modal-button {
        width: 48%;
    }

    .settings-modal {
        background-color: rgba(0, 0, 0, 0.2);
        color: #ffffff;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        border-color: rgba(255, 255, 255, 0.125);
    }

    .custom-select {
        color: #000000;
    }

    .card {
        background-color: transparent;
        border-color: rgba(255, 255, 255, 0.125);
    }

    .btn {
        color: #ffffff;
        background-color: rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.125);
    }
    .btn:hover,
    .btn:active {
        color: #ffffff;
        background-color: rgba(0, 0, 0, 0.4);
        border-color: rgba(255, 255, 255, 0.125);
    }
</style>

<button
    type="button"
    class="settings {mode}"
    data-toggle="modal"
    data-target="#settings-modal"
    style="backdrop-filter: blur({blur_amount});"
    data-backdrop="static"
    data-keyboard="false">
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 48 48">
        <path d="M0 0h48v48h-48z" fill="none" />
        <path
            d="M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97l-.75-5.3c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3c-1.22.51-2.35 1.17-3.38 1.97l-4.98-2.01c-.45-.17-.97 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31c-.08.64-.14 1.29-.14 1.95s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3c1.22-.51 2.35-1.17 3.38-1.97l4.98 2.01c.45.17.97 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zm-14.86 5.05c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
            fill="white" />
    </svg>
</button>

<div style="text-align: left;">
    <div
        class="modal fade"
        id="settings-modal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="settings-modal-label"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div
                class="modal-content settings-modal"
                style="backdrop-filter: blur({blur_amount});">
                <div class="modal-header justify-content-center">
                    <h5 class="modal-title" id="settings-modal-label">
                        Settings
                    </h5>
                </div>
                <div class="modal-body">
                    <p>Background Image</p>
                    <input
                        type="text"
                        id="background-image"
                        bind:value={background_image} />
                    <br />
                    <br />
                    <p>Mode</p>
                    <select
                        class="mode-select browser-default custom-select"
                        id="mode">
                        <option class="mode-option" value="material">
                            Material
                        </option>
                        <option class="mode-option" value="cupertino">
                            Cupertino
                        </option>
                        <option class="mode-option" value="fluid">Fluid</option>
                    </select>
                    <br />
                    <br />
                    <p>Blur Amount</p>
                    <input type="text" id="blur-amount" value={blur_amount} />
                    <br />
                    <br />
                    <p>Search Engine</p>
                    <select
                        class="mode-select browser-default custom-select"
                        id="search-engine">
                        <option class="search-engine-option" value="DuckDuckGo">
                            DuckDuckGo
                        </option>
                        <option class="search-engine-option" value="Google">
                            Google
                        </option>
                        <option class="search-engine-option" value="Yahoo!">
                            Yahoo!
                        </option>
                        <option class="search-engine-option" value="Ecosia">
                            Ecosia
                        </option>
                    </select>
                    <br />
                    <br />
                    <p>Favourites</p>
                    <div>
                        <button
                            class="btn btn-block mb-4"
                            data-toggle="collapse"
                            data-target="#favourites-0"
                            aria-expanded="false"
                            aria-controls="favourites-0">Item 1</button>
                        <div class="collapse" id="favourites-0">
                            <div class="card card-body mb-4">
                                <p>Name</p>
                                <input
                                    class="mb-4"
                                    type="text"
                                    id="favourites-name-0"
                                    value={favourites[0].name} />
                                <p>SVG</p>
                                <input
                                    class="mb-4"
                                    type="text"
                                    id="favourites-svg-0"
                                    value={favourites[0].svg} />
                                <p>URL</p>
                                <input
                                    type="text"
                                    id="favourites-href-0"
                                    value={favourites[0].href} />
                            </div>
                        </div>
                        <button
                            class="btn btn-block mb-4"
                            data-toggle="collapse"
                            data-target="#favourites-1"
                            aria-expanded="false"
                            aria-controls="favourites-1">Item 2</button>
                        <div class="collapse" id="favourites-1">
                            <div class="card card-body mb-4">
                                <p>Name</p>
                                <input
                                    class="mb-4"
                                    type="text"
                                    id="favourites-name-1"
                                    value={favourites[1].name} />
                                <p>SVG</p>
                                <input
                                    class="mb-4"
                                    type="text"
                                    id="favourites-svg-1"
                                    value={favourites[1].svg} />
                                <p>URL</p>
                                <input
                                    type="text"
                                    id="favourites-href-1"
                                    value={favourites[1].href} />
                            </div>
                        </div>
                        <button
                            class="btn btn-block mb-4"
                            data-toggle="collapse"
                            data-target="#favourites-2"
                            aria-expanded="false"
                            aria-controls="favourites-2">Item 3</button>
                        <div class="collapse" id="favourites-2">
                            <div class="card card-body mb-4">
                                <p>Name</p>
                                <input
                                    class="mb-4"
                                    type="text"
                                    id="favourites-name-2"
                                    value={favourites[2].name} />
                                <p>SVG</p>
                                <input
                                    class="mb-4"
                                    type="text"
                                    id="favourites-svg-2"
                                    value={favourites[2].svg} />
                                <p>URL</p>
                                <input
                                    type="text"
                                    id="favourites-href-2"
                                    value={favourites[2].href} />
                            </div>
                        </div>
                        <button
                            class="btn btn-block mb-4"
                            data-toggle="collapse"
                            data-target="#favourites-3"
                            aria-expanded="false"
                            aria-controls="favourites-3">Item 4</button>
                        <div class="collapse" id="favourites-3">
                            <div class="card card-body mb-4">
                                <p>Name</p>
                                <input
                                    class="mb-4"
                                    type="text"
                                    id="favourites-name-3"
                                    value={favourites[3].name} />
                                <p>SVG</p>
                                <input
                                    class="mb-4"
                                    type="text"
                                    id="favourites-svg-3"
                                    value={favourites[3].svg} />
                                <p>URL</p>
                                <input
                                    type="text"
                                    id="favourites-href-3"
                                    value={favourites[3].href} />
                            </div>
                        </div>
                        <button
                            class="btn btn-block mb-4"
                            data-toggle="collapse"
                            data-target="#favourites-4"
                            aria-expanded="false"
                            aria-controls="favourites-4">Item 5</button>
                        <div class="collapse" id="favourites-4">
                            <div class="card card-body mb-4">
                                <p>Name</p>
                                <input
                                    class="mb-4"
                                    type="text"
                                    id="favourites-name-4"
                                    value={favourites[4].name} />
                                <p>SVG</p>
                                <input
                                    class="mb-4"
                                    type="text"
                                    id="favourites-svg-4"
                                    value={favourites[4].svg} />
                                <p>URL</p>
                                <input
                                    type="text"
                                    id="favourites-href-4"
                                    value={favourites[4].href} />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer justify-content-center">
                    <button
                        type="button"
                        class="btn settings-modal-button"
                        data-dismiss="modal">Close</button>
                    <button
                        type="button"
                        class="btn settings-modal-button"
                        data-dismiss="modal"
                        on:click={save_changes}>Save</button>
                </div>
            </div>
        </div>
    </div>
</div>
