import * as $ from 'svelte/internal/server';
import { browser } from "$app/environment";
import Search from "$lib/search/Search.svelte";
import SearchBox from "$lib/search/SearchBox.svelte";

export default function _page($$renderer) {
	if (browser) {
		$$renderer.push('<!--[0-->');
		Search($$renderer, {});
		$$renderer.push(`<!----> `);
		SearchBox($$renderer, {});
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}