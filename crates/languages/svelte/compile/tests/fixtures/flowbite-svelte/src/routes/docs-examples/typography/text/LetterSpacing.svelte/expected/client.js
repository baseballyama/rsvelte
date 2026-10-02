import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function LetterSpacing($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		space: 'tighter',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Flowbite app will help you improve yourself by analysing your everyday life.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		space: 'tight',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Flowbite app will help you improve yourself by analysing your everyday life.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		space: 'normal',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Flowbite app will help you improve yourself by analysing your everyday life.');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	P(node_3, {
		space: 'wide',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Flowbite app will help you improve yourself by analysing your everyday life.');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	P(node_4, {
		space: 'wider',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Flowbite app will help you improve yourself by analysing your everyday life.');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	P(node_5, {
		space: 'widest',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Flowbite app will help you improve yourself by analysing your everyday life.');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}