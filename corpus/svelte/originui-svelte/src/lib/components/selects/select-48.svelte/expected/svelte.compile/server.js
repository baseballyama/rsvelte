import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import SelectNative from '$lib/components/ui/select-native.svelte';

export default function Select_48($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="space-y-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Multiple select (native)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="border-input overflow-hidden rounded-lg border">`);

	SelectNative($$renderer, {
		id: uid,
		class: 'rounded-none border-none',
		multiple: true,
		value: '',
		children: ($$renderer) => {
			$$renderer.option({ value: 's1' }, ($$renderer) => {
				$$renderer.push(`React`);
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

			$$renderer.push(` `);

			$$renderer.option({ value: 's5' }, ($$renderer) => {
				$$renderer.push(`Vue`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's6' }, ($$renderer) => {
				$$renderer.push(`Angular`);
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div>`);
}