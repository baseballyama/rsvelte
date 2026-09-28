import * as $ from 'svelte/internal/server';
import SearchResultList from './SearchResultList.svelte';

export default function SearchResults($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { results, query } = $$props;

		if (results.length > 0) {
			$$renderer.push('<!--[0-->');
			SearchResultList($$renderer, { results, query });
		} else if (query) {
			$$renderer.push(`<!--[1--><p class="info fst-400 svelte-16g9f3m">No results</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}