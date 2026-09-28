import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import SelectNative from '$lib/components/ui/select-native.svelte';

export default function Select_11($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="space-y-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Select with option groups (native)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SelectNative($$renderer, {
		id: uid,
		children: ($$renderer) => {
			$$renderer.push(`<optgroup label="Frontend">`);

			$$renderer.option({ value: 's1' }, ($$renderer) => {
				$$renderer.push(`Svelte`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's2' }, ($$renderer) => {
				$$renderer.push(`Vue`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's3' }, ($$renderer) => {
				$$renderer.push(`Angular`);
			});

			$$renderer.push(`</optgroup> <optgroup label="Backend">`);

			$$renderer.option({ value: 's4' }, ($$renderer) => {
				$$renderer.push(`Node.js`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's5' }, ($$renderer) => {
				$$renderer.push(`Python`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's6' }, ($$renderer) => {
				$$renderer.push(`Java`);
			});

			$$renderer.push(`</optgroup>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}