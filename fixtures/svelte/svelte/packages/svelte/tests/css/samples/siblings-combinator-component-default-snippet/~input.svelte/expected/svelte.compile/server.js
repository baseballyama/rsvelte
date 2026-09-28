import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Input($$renderer) {
	$$renderer.push(`<x class="svelte-1w7ricf"></x> `);

	Child($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<y class="svelte-1w7ricf">this should be green</y>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}