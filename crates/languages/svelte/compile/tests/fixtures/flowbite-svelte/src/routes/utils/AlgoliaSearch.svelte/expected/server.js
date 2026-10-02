import * as $ from 'svelte/internal/server';
import "@docsearch/css";
import docsearch from "@docsearch/js";

export default function AlgoliaSearch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const init = (searchContainer) => {
			// Algolia docsearch
			docsearch({
				container: searchContainer,
				appId: "JWUQIZ9PGE",
				indexName: "flowbite-svelte",
				apiKey: "db6396bd138ab613540d2a2bc07f958d",
				placeholder: "Search documentation"
			});
		};

		$$renderer.push(`<div id="docsearch" class="ms-3 hidden xl:block xl:ps-4"></div>`);
	});
}