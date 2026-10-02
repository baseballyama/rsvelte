import * as $ from 'svelte/internal/server';
import { Search, SearchMenuSkeleton } from "carbon-components-svelte";

export default function SkeletonState($$renderer) {
	$$renderer.push(`<div class="bx--search-menu"><div class="bx--search-menu__search">`);

	Search($$renderer, {
		skeleton: true,
		labelText: 'Search',
		placeholder: 'Search...'
	});

	$$renderer.push(`<!----> `);
	SearchMenuSkeleton($$renderer, {});
	$$renderer.push(`<!----></div></div>`);
}