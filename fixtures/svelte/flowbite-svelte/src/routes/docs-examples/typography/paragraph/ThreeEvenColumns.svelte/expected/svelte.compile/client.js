import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P, Layout } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function ThreeEvenColumns($$anchor) {
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

	Layout(node_1, {
		class: 'grid-cols-1 gap-6 sm:grid-cols-3',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			P(node_2, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams\n    have richer contextual information to rapidly respond to requests, incidents, and changes.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			P(node_3, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n    audit trail for every change.');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			P(node_4, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n    audit trail for every change.');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_1, 2);

	P(node_5, {
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n  audit trail for every change.');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}