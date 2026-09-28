import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import SelectNative from '$lib/components/ui/select-native.svelte';

export default function Select_06($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="[&amp;_svg]:text-destructive/80 space-y-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Select with error (native)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SelectNative($$renderer, {
		id: uid,
		class: 'border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20',
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

	$$renderer.push(`<!----> <p class="text-destructive mt-2 text-xs" role="alert" aria-live="polite">Selected option is invalid</p></div>`);
}