import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '@docsearch/css';
import docsearch from '@docsearch/js';

var root = $.from_html(`<div id="docsearch" class="svelte-1d0svjt"></div>`);

export default function DocSearch($$anchor, $$props) {
	$.push($$props, true);

	const init = (searchContainer) => {
		// @ts-expect-error idk
		docsearch({
			container: searchContainer,
			appId: 'AIGTN0IYT1',
			indexName: 'inspect-eirik',
			apiKey: 'ce7552a342fda13ea0251618e1e6c2ff',
			insights: true,
			placeholder: 'Search documentation'
		});
	};

	var div = root();

	$.action(div, ($$node) => init?.($$node));
	$.append($$anchor, div);
	$.pop();
}