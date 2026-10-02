import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "flowbite-svelte";

export default function DocBadge($$anchor, $$props) {
	Badge($$anchor, {
		get class() {
			return `bg-primary-100 text-primary-700 dark:text-primary-700 border-primary-700 dark:border-primary-700 dark:bg-gray-700 ${$$props.class ?? ''}`;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}