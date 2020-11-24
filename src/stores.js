import { writable } from 'svelte/store';

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

export const background_image_store = writable(localStorage.getItem("danktab_background_image"));
export const mode_store = writable(localStorage.getItem("danktab_mode"));
export const blur_amount_store = writable(localStorage.getItem("danktab_blur_amount"));
export const favourites_store = writable(JSON.parse(localStorage.getItem("danktab_favourites")));
export const search_engine_store = writable(localStorage.getItem("danktab_search_engine"));

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