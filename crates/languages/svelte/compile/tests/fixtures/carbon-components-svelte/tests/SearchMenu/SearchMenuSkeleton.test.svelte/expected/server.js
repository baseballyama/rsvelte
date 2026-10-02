import * as $ from 'svelte/internal/server';
import Search from "carbon-components-svelte/Search/Search.svelte";
import SearchMenuSkeleton from "carbon-components-svelte/SearchMenu/SearchMenuSkeleton.svelte";

export default function SearchMenuSkeleton_test($$renderer) {
	$$renderer.push(`<div class="bx--search-menu"><div class="bx--search-menu__search">`);
	Search($$renderer, { skeleton: true, labelText: 'Search' });
	$$renderer.push(`<!----> `);
	SearchMenuSkeleton($$renderer, { count: 3 });
	$$renderer.push(`<!----></div></div>`);
}