import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from './Inner.svelte';

export default function Outer($$anchor, $$props) {
	Inner($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.slot(node, $$props, 'default', {}, null);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}