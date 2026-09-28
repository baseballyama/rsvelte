import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Sizes($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Heading 1');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Heading(node_1, {
		tag: 'h2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Heading 2');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Heading(node_2, {
		tag: 'h3',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Heading 3');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Heading(node_3, {
		tag: 'h4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Heading 4');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Heading(node_4, {
		tag: 'h5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Heading 5');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Heading(node_5, {
		tag: 'h6',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Heading 6');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}