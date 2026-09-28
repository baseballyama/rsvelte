import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Blockquote, P } from "flowbite-svelte";

var root = $.from_html(`<!> <div class="grid grid-cols-1 md:grid-cols-2 md:gap-6"><!> <!></div> <!>`, 1);

export default function Paragraph($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		class: 'mb-3',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have\n  richer contextual information to rapidly respond to requests, incidents, and changes.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	P(node_1, {
		class: 'mb-3',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams\n    have richer contextual information to rapidly respond to requests, incidents, and changes.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Blockquote(node_2, {
		class: 'mb-3',
		size: 'xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('" Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to complex dashboard. Perfect choice for your next SaaS application. "');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	P(node_3, {
		class: 'mb-3',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n  audit trail for every change.');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}