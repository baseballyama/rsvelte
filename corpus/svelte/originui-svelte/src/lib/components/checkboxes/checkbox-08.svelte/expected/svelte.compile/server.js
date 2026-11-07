import * as $ from 'svelte/internal/server';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Checkbox_08($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="flex gap-6"><div class="flex items-center gap-2">`);
	Checkbox($$renderer, { id: `${uid}-a` });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: `${uid}-a`,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Svelte`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
	Checkbox($$renderer, { id: `${uid}-b` });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: `${uid}-b`,
		children: ($$renderer) => {
			$$renderer.push(`<!---->SvelteKit`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
	Checkbox($$renderer, { id: `${uid}-c` });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: `${uid}-c`,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Astro`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div>`);
}