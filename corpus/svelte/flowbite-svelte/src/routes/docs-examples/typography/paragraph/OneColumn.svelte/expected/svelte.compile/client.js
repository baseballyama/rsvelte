import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function OneColumn($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have\n  richer contextual information to rapidly respond to requests, incidents, and changes.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n  audit trail for every change.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}