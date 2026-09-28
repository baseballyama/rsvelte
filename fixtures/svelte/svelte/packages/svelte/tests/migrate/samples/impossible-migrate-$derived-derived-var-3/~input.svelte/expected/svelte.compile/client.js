import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	let derived;

	Component($$anchor, {
		$$slots: {
			derived: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.slot(node, $$props, 'derived', {}, null);
				$.append($$anchor, fragment_1);
			}
		}
	});
}