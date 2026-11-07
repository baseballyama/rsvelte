import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function TextJustify($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		justify: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Get started with an enterprise-level, profesionally designed, fully responsive, and HTML semantic set of web pages, sections and over 400+ components crafted with the utility classes from Tailwind\n  CSS and based on the Flowbite component library');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Get started with an enterprise-level, profesionally designed, fully responsive, and HTML semantic set of web pages, sections and over 400+ components crafted with the utility classes from Tailwind\n  CSS and based on the Flowbite component library');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}