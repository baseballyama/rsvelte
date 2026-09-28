import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function TextColor($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		class: 'text-blue-700 dark:text-blue-500',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('This text is in the blue color.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		class: 'text-green-700 dark:text-green-500',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('This text is in the green color.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		class: 'text-red-700 dark:text-red-500',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('This text is in the red color.');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	P(node_3, {
		class: 'text-purple-700 dark:text-purple-500',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('This text is in the purple color.');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	P(node_4, {
		class: 'text-teal-700 dark:text-teal-500',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('This text is in the teal color.');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}