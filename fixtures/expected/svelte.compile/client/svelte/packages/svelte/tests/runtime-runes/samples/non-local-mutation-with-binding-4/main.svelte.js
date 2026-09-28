import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Outer from './Outer.svelte';
import Inner from './Inner.svelte';

export default function Main($$anchor) {
	let object = $.state($.proxy({ count: 0 }));

	Outer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Inner($$anchor, {
				get object() {
					return $.get(object);
				},

				set object($$value) {
					$.set(object, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});
}