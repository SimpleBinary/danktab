<script>
	import { favourites_store } from "./stores.js";
	import { Container } from "sveltestrap";
	import { onMount } from "svelte";
	import Favourite from "./components/favourite.svelte";
	import Settings from "./components/settings.svelte";

	export let background_image;
	export let blur_amount;
	export let mode;
	export let favourites;
	export let search_engine;
	export let tld_list;

	function lowercase(x) {
		x = x.toLowerCase().split(" ").join("-");
		return x;
	}

	onMount(() => {
		document
			.getElementsByClassName("active-highlight")[0]
			.addEventListener("submit", (e) => {
				e.preventDefault();
				let is_url = false;
				tld_list.forEach((tld) => {
					if (
						document
							.getElementById("search-bar")
							.value.endsWith("." + tld) &&
						!document
							.getElementById("search-bar")
							.value.includes(" ") &&
						!document
							.getElementById("search-bar")
							.value.startsWith(".")
					) {
						window.location.replace(
							"http://" +
								document.getElementById("search-bar").value
						);
						is_url = true;
					}
				});

				if (!is_url) {
					if (
						document
							.getElementById("search-bar")
							.value.startsWith("!")
					) {
						window.location.replace(
							encodeURI(
								"https://duckduckgo.com/?q=" +
									document.getElementById("search-bar").value
							)
						);
					} else {
						window.location.replace(
							encodeURI(
								"https://duckduckgo.com/?q=" +
									"!" +
									lowercase(search_engine) +
									" " +
									document.getElementById("search-bar").value
							)
						);
					}
				}
			});

		let dragging, dragged_over;

		const initialise_drag = (array) => {
			favourites = array.slice();
		};

		const compare = (e) => {
			[...document.getElementsByClassName("favourite")].forEach(
				(node) => {
					node.style.border = "none";
				}
			);

			try {
				let index1 = favourites.findIndex((item, i) => {
					return item.name === dragging.name;
				});
				let index2 = favourites.findIndex((item, i) => {
					return (
						item.name ===
						JSON.parse(dragged_over.getAttribute("full-object"))
							.name
					);
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

				favourites = favourites;

				favourites_store.set(favourites);
			} catch {}
		};

		const set_dragged_over = (e) => {
			e.preventDefault();
			dragged_over = e.target;

			if (JSON.parse(dragged_over.getAttribute("full-object")) === null) {
				[...document.getElementsByClassName("favourite")].forEach(
					(node) => {
						node.style.border = "none";
					}
				);
			}

			try {
				favourites.findIndex((item, i) => {
					if (
						item.name ===
						JSON.parse(dragged_over.getAttribute("full-object"))
							.name
					) {
						[
							...document.getElementsByClassName("favourite"),
						].forEach((node) => {
							node.style.border = "none";
						});

						dragged_over.style.border = "1px solid #ffffff40";
					}
				});
			} catch {}
		};

		const set_dragging = (e) => {
			dragging = JSON.parse(e.target.getAttribute("full-object"));
		};

		initialise_drag(favourites);

		[...document.getElementsByClassName("favourite")].forEach((node) => {
			node.addEventListener("dragstart", set_dragging);
			node.addEventListener("dragover", set_dragged_over);
			node.addEventListener("drop", compare);
		});
	});
</script>

<style>
	main {
		text-align: center;
		padding: 0;
		margin: 0;
		height: 100%;
		width: 100%;
		background-repeat: no-repeat;
		background-attachment: fixed;
		background-size: cover;
	}

	#search-bar {
		border: 0;
		background-color: rgba(0, 0, 0, 0.3);
		outline: 0;
		color: #fff;
		padding: 1em;
		padding-left: 1.5em;
		padding-right: 1.5em;
		box-shadow: 0px 16px 27px 0px rgba(0, 0, 0, 0.3);
		width: 495px !important;
		margin: 0 !important;
		margin-bottom: 20px !important;
	}

	#search-bar.fluid {
		width: 570px !important;
		margin-bottom: 5px !important;
		border-radius: 0;
	}

	#search-bar.material {
		border-radius: 3em;
	}

	#search-bar.cupertino {
		border-radius: 0.7em;
	}

	@media (max-width: 768px) {
		#search-bar {
			width: 270px !important;
		}
	}

	.float-button {
		padding: 0;
		margin: 0;
	}
</style>

<svelte:head>
	<!-- Bootstrap CSS -->
	<link
		rel="stylesheet"
		href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
</svelte:head>

<main style="background-image: url({background_image})">
	<Container
		class="d-flex flex-row justify-content-center align-items-center w-100 h-100">
		<Container>
			<form class="form active-highlight" id="search-form">
				<input
					style="backdrop-filter: blur({blur_amount}); -webkit-backdrop-filter: blur({blur_amount});"
					class="mr-sm-2 {mode}"
					type="search"
					placeholder="Search with {search_engine}"
					aria-label="Search"
					id="search-bar"
					autocomplete="off" />
			</form>
			<Container class="favourites-container">
				{#each favourites as favourite}
					<Favourite
						name={favourite.name}
						svg={favourite.svg}
						href={favourite.href}
						is_first={favourite.is_first}
						is_last={favourite.is_last}
						full_object={favourite} />
				{/each}
			</Container>
		</Container>
		<Settings />
	</Container>
</main>
