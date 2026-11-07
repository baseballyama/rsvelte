import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import SelectNative from '$lib/components/ui/select-native.svelte';

export default function Select_07($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="space-y-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Select with gray background (native)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SelectNative($$renderer, {
		id: uid,
		class: 'bg-muted border-transparent shadow-none',
		children: ($$renderer) => {
			$$renderer.option({ value: 's1' }, ($$renderer) => {
				$$renderer.push(`Svelte`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's2' }, ($$renderer) => {
				$$renderer.push(`Next.js`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's3' }, ($$renderer) => {
				$$renderer.push(`Astro`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's4' }, ($$renderer) => {
				$$renderer.push(`Gatsby`);
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}