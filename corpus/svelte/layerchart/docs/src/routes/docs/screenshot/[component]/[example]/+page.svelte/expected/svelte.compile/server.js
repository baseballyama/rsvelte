import * as $ from 'svelte/internal/server';
import Example from '$lib/components/Example.svelte';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let component = page.params.component;
		let example = page.params.example;

		$.head('315qpg', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(component)} - ${$.escape(example)} - LayerChart Examples</title>`);
			});
		});

		$$renderer.push(`<div class="p-2">`);
		Example($$renderer, { name: example, component, variant: 'basic' });
		$$renderer.push(`<!----></div>`);
	});
}