import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import SelectNative from '$lib/components/ui/select-native.svelte';
import Clock from '@lucide/svelte/icons/clock';

export default function Select_03($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="space-y-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Select with icon (native)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="group relative">`);

	SelectNative($$renderer, {
		id: uid,
		class: 'ps-9',
		children: ($$renderer) => {
			$$renderer.option({ value: 's1' }, ($$renderer) => {
				$$renderer.push(`00:00 AM - 11:59 PM`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's2' }, ($$renderer) => {
				$$renderer.push(`01:00 AM - 12:59 PM`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's3' }, ($$renderer) => {
				$$renderer.push(`02:00 AM - 01:59 PM`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 's4' }, ($$renderer) => {
				$$renderer.push(`03:00 AM - 02:59 PM`);
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[[disabled]]:opacity-50">`);
	Clock($$renderer, { size: 16, 'aria-hidden': 'true' });
	$$renderer.push(`<!----></div></div></div>`);
}