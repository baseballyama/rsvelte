import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	MyComponent($$anchor, {
		variant: 'outlined',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.slot(node, $$props, 'default', {}, null);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}