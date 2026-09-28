import * as $ from 'svelte/internal/server';
import { page } from "$app/stores";
import { browser } from "$app/environment";
import { onMount } from "svelte";
import Fuse from "fuse.js";
import { goto } from "$app/navigation";
import { dev } from "$app/environment";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const fuseOptions = {
			keys: [
				{ name: "title", weight: 3 },
				{ name: "description", weight: 2 },
				{ name: "body", weight: 1 }
			],
			ignoreLocation: true,
			threshold: 0.3
		};

		let fuse = void 0;
		let loading = true;
		let error = false;

		onMount(async () => {
			try {
				const response = await fetch("/search/api.json");

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const searchData = await response.json();

				if (searchData && searchData.index && searchData.indexData) {
					const index = Fuse.parseIndex(searchData.index);

					fuse = new Fuse(searchData.indexData, fuseOptions, index);
				}
			} catch(e) {
				console.error("Failed to load search data", e);
				error = true;
			} finally {
				loading = false;
				document.getElementById("search-input")?.focus();
			}
		});

		let results = [];

		// searchQuery is $page.url.hash minus the "#" at the beginning if present
		let searchQuery = decodeURIComponent($.store_get($$store_subs ??= {}, '$page', page).url.hash.slice(1) ?? "");

		// Update the URL hash when searchQuery changes so the browser can bookmark/share the search results
		let focusItem = 0;

		function onKeyDown(event) {
			if (event.key === "Escape") {
				searchQuery = "";
			} else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				focusItem += event.key === "ArrowDown" ? 1 : -1;

				if (focusItem < 0) {
					focusItem = 0;
				} else if (focusItem > results.length) {
					focusItem = results.length;
				}

				if (focusItem === 0) {
					document.getElementById("search-input")?.focus();
				} else {
					document.getElementById(`search-result-${focusItem}`)?.focus();
				}
			}
		}

		$.head('1ou5319', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Search</title>`);
			});

			$$renderer.push(`<meta name="description" content="Search our website."/>`);
		});

		$$renderer.push(`<div class="py-8 lg:py-12 px-6 max-w-lg mx-auto"><div class="text-3xl lg:text-5xl font-medium text-primary flex gap-3 items-baseline text-center place-content-center"><div class="text-center leading-relaxed font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">Search</div></div> <label class="input input-bordered flex items-center gap-2 mt-10 mb-5 w-full"><input id="search-input" type="text" class="grow w-full" placeholder="Search"${$.attr('value', searchQuery)} aria-label="Search input"/></label> `);

		if (loading && searchQuery.length > 0) {
			$$renderer.push(`<!--[0--><div class="text-center mt-10 text-accent text-xl">Loading...</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="text-center mt-10 text-accent text-xl">Error connecting to search. Please try again later.</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (!loading && searchQuery.length > 0 && results.length === 0 && !error) {
			$$renderer.push(`<!--[0--><div class="text-center mt-10 text-accent text-xl">No results found</div> `);

			if (dev) {
				$$renderer.push(`<!--[0--><div class="text-center mt-4 font-mono">Development mode only message: if you're missing content, rebuild your
        local search index with \`npm run build\`</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div><!--[-->`);

		const each_array = $.ensure_array_like(results);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let result = each_array[i];

			$$renderer.push(`<a${$.attr('href', result.item.path || "/")}${$.attr('id', `search-result-${$.stringify(i + 1)}`)} class="card my-6 bg-white shadow-xl flex-row overflow-hidden focus:mx-[-10px] focus:my-[-5px] focus:border-4 focus:border-secondary"><div class="flex-none w-6 md:w-32 bg-secondary"></div> <div class="py-6 px-6"><div class="text-xl">${$.escape(result.item.title)}</div> <div class="text-sm text-accent">${$.escape(result.item.path)}</div> <div class="text-slate-500">${$.escape(result.item.description)}</div></div></a>`);
		}

		$$renderer.push(`<!--]--></div> <div></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}