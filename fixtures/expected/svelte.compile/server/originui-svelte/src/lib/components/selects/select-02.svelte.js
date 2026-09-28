import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import SelectNative from '$lib/components/ui/select-native.svelte';

export default function Select_02($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="space-y-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Select with placeholder (native)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SelectNative($$renderer, {
		id: uid,
		children: ($$renderer) => {
			$$renderer.option({ value: '', disabled: true, selected: true }, ($$renderer) => {
				$$renderer.push(`Please select a value`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's1' }, ($$renderer) => {
				$$renderer.push(`1 to 5`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's2' }, ($$renderer) => {
				$$renderer.push(`5 to 10`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's3' }, ($$renderer) => {
				$$renderer.push(`More than 10`);
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}