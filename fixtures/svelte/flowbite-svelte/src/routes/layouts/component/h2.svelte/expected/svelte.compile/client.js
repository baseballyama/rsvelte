import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Anchor from "./Anchor.svelte";

export default function H2($$anchor, $$props) {
	Anchor($$anchor, {
		tag: 'h2',
		class: 'text-2xl leading-tight font-bold text-gray-900 dark:text-white',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}