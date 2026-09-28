import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "@docsearch/css";
import docsearch from "@docsearch/js";

var root = $.from_html(`<div id="docsearch" class="ms-3 hidden xl:block xl:ps-4"></div>`);

export default function AlgoliaSearch($$anchor, $$props) {
	$.push($$props, true);

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

	var div = root();

	$.action(div, ($$node) => init?.($$node));
	$.append($$anchor, div);
	$.pop();
}