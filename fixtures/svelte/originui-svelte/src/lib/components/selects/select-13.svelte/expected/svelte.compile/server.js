import * as $ from 'svelte/internal/server';
import SelectNative from '$lib/components/ui/select-native.svelte';

export default function Select_13($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="group relative"><label${$.attr('for', uid)} class="bg-background text-foreground absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-[select:disabled]:opacity-50">Select with overlapping label (native)</label> `);

	SelectNative($$renderer, {
		id: uid,
		children: ($$renderer) => {
			$$renderer.option({ value: '', disabled: true, selected: true }, ($$renderer) => {
				$$renderer.push(`Select framework`);
			});

			$$renderer.push(` `);

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