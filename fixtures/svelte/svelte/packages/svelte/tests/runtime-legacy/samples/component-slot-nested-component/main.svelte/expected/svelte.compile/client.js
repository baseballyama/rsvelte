import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Outer from './Outer.svelte';
import Inner from './Inner.svelte';

export default function Main($$anchor) {
	Outer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Inner($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('foo');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}