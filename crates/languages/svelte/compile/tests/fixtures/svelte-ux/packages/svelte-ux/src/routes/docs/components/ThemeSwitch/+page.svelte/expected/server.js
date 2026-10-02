import * as $ from 'svelte/internal/server';
import { ThemeSwitch } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			ThemeSwitch($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Customize Switch</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			ThemeSwitch($$renderer, {
				classes: {
					icon: 'text-primary-content',
					switch: 'bg-secondary w-20',
					toggle: 'bg-accent'
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}