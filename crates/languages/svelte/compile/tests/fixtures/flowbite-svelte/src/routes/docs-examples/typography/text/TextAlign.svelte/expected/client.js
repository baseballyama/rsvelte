import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function TextAlign($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		align: 'left',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Get started with an enterprise-level, profesionally designed, fully responsive, and HTML semantic set of web pages, sections and over 400+ components crafted with the utility classes from Tailwind\n  CSS and based on the Flowbite component library');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Get started with an enterprise-level, profesionally designed, fully responsive, and HTML semantic set of web pages, sections and over 400+ components crafted with the utility classes from Tailwind\n  CSS and based on the Flowbite component library');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		align: 'right',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Get started with an enterprise-level, profesionally designed, fully responsive, and HTML semantic set of web pages, sections and over 400+ components crafted with the utility classes from Tailwind\n  CSS and based on the Flowbite component library');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	P(node_3, {
		justify: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Get started with an enterprise-level, profesionally designed, fully responsive, and HTML semantic set of web pages, sections and over 400+ components crafted with the utility classes from Tailwind\n  CSS and based on the Flowbite component library');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	P(node_4, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Get started with an enterprise-level, profesionally designed, fully responsive, and HTML semantic set of web pages, sections and over 400+ components crafted with the utility classes from Tailwind\n  CSS and based on the Flowbite component library');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}