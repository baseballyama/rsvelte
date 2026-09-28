import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Blockquote, P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Solid($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Does your user know how to exit out of screens? Can they follow your intended user journey and buy something from the site you’ve designed? By running a usability test, you’ll be able to see how\n  users will interact with your design once it’s live.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Blockquote(node_1, {
		border: true,
		bg: true,
		class: 'my-4 p-4',
		children: ($$anchor, $$slotProps) => {
			P($$anchor, {
				size: 'xl',
				height: 'relaxed',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('"Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to complex dashboard. Perfect choice for your next SaaS application."');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('First of all you need to understand how Flowbite works. This library is not another framework. Rather, it is a set of components based on Tailwind CSS that you can just copy-paste from the\n  documentation.');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}