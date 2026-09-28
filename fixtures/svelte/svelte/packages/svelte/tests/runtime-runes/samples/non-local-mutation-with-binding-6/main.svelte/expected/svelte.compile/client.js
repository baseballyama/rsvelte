import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component1 from './Component1.svelte';
import Component2 from './Component2.svelte';
import Component3 from './Component3.svelte';

export default function Main($$anchor) {
	let count = $.state($.proxy({ value: 0 }));

	Component1($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Component2($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Component3($$anchor, {
						get count() {
							return $.get(count);
						},

						set count($$value) {
							$.set(count, $$value, true);
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}