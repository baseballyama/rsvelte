import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Blockquote } from "flowbite-svelte";
import { QuoteSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> "Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to complex dashboard. Perfect choice for your next SaaS application."`, 1);

export default function Icon($$anchor) {
	Blockquote($$anchor, {
		size: 'xl',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			QuoteSolid(node, { class: 'h-10 w-10 text-gray-400 dark:text-gray-600' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}