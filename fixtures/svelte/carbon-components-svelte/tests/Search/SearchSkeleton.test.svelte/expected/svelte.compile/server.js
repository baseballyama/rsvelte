import * as $ from 'svelte/internal/server';
import Search from "carbon-components-svelte/Search/Search.svelte";
import SearchSkeleton from "carbon-components-svelte/Search/SearchSkeleton.svelte";

export default function SearchSkeleton_test($$renderer) {
	Search($$renderer, { skeleton: true, labelText: 'Default skeleton' });
	$$renderer.push(`<!----> `);
	Search($$renderer, { size: 'lg', skeleton: true, labelText: 'Large skeleton' });
	$$renderer.push(`<!----> `);
	Search($$renderer, { size: 'sm', skeleton: true, labelText: 'Small skeleton' });
	$$renderer.push(`<!----> `);
	SearchSkeleton($$renderer, { hideLabel: true, 'data-testid': 'skeleton-hide-label' });
	$$renderer.push(`<!---->`);
}