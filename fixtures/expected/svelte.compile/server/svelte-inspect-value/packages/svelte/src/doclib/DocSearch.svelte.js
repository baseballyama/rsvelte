import * as $ from 'svelte/internal/server';
import '@docsearch/css';
import docsearch from '@docsearch/js';

export default function DocSearch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<div id="docsearch" class="svelte-1d0svjt"></div>`);
	});
}