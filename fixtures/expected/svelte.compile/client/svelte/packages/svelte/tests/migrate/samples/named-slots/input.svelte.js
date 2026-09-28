import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

export default function Input($$anchor, $$props) {
	Component($$anchor, {
		$$slots: {
			msg: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.slot(node, $$props, 'default', {}, null);
				$.append($$anchor, fragment_1);
			}
		}
	});
}