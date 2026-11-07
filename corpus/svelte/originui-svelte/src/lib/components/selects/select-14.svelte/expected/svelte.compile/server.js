import * as $ from 'svelte/internal/server';
import SelectNative from '$lib/components/ui/select-native.svelte';

export default function Select_14($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="border-input bg-background focus-within:border-ring focus-within:ring-ring/20 relative rounded-lg border shadow-xs shadow-black/5 transition-shadow focus-within:ring-[3px] focus-within:outline-hidden has-[select:disabled]:cursor-not-allowed has-[select:disabled]:opacity-50 [&amp;:has(select:is(:disabled))_*]:pointer-events-none"><label${$.attr('for', uid)} class="text-foreground block px-3 pt-2 text-xs font-medium">Select with inset label (native)</label> `);

	SelectNative($$renderer, {
		id: uid,
		class: 'border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
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