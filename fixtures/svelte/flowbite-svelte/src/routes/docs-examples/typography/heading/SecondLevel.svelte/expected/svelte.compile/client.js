import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading, P, A } from "flowbite-svelte";
import { ChevronRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Read more <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function SecondLevel($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h2',
		class: 'text-4xl font-extrabold ',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Payments tool for companies');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		class: 'my-4 text-gray-500',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Start developing with an open-source library of over 450+ UI components, sections, and pages built with the utility classes from Tailwind CSS and designed in Figma.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		class: 'mb-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions. Accelerate critical development work, eliminate toil, and deploy changes with ease.');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	A(node_3, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_4 = $.sibling($.first_child(fragment_1));

			ChevronRightOutline(node_4, { class: 'ms-2 h-3.5 w-3.5' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}