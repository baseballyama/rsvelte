import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P, Layout } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="col-span-2"><!> <!></div> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Layout_1($$anchor) {
	var fragment = root_3();
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

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have\n  richer contextual information to rapidly respond to requests, incidents, and changes.');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Layout(node_3, {
		class: 'gap-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_4 = $.first_child(fragment_1);

			P(node_4, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams\n    have richer contextual information to rapidly respond to requests, incidents, and changes.');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			P(node_5, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n    audit trail for every change.');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	P(node_6, {
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n  audit trail for every change.');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	P(node_7, {
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have\n  richer contextual information to rapidly respond to requests, incidents, and changes.');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Layout(node_8, {
		class: 'grid-cols-1 gap-6 sm:grid-cols-3',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_9 = $.first_child(fragment_2);

			P(node_9, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams\n    have richer contextual information to rapidly respond to requests, incidents, and changes.');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			P(node_10, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n    audit trail for every change.');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			P(node_11, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n    audit trail for every change.');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_8, 2);

	P(node_12, {
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n  audit trail for every change.');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	P(node_13, {
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have\n  richer contextual information to rapidly respond to requests, incidents, and changes.');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	Layout(node_14, {
		class: 'grid-cols-1 gap-6 sm:grid-cols-3',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var div = $.first_child(fragment_3);
			var node_15 = $.child(div);

			P(node_15, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams\n      have richer contextual information to rapidly respond to requests, incidents, and changes.');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_15, 2);

			P(node_16, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n      audit trail for every change.');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var node_17 = $.sibling(div, 2);

			P(node_17, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n    audit trail for every change.');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_14, 2);

	P(node_18, {
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_15 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n  audit trail for every change.');

			$.append($$anchor, text_15);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}