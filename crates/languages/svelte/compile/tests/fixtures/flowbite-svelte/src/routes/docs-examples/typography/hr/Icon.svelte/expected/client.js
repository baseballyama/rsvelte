import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Hr, P } from "flowbite-svelte";
import { QuoteSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="text-center"><!> <!> <!></div>`);

export default function Icon($$anchor) {
	var div = root();
	var node = $.child(div);

	P(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams\n    have richer contextual information to rapidly respond to requests, incidents, and changes.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Hr(node_1, {
		class: 'h-1 w-64',
		children: ($$anchor, $$slotProps) => {
			QuoteSolid($$anchor, { class: 'h-6 w-6 text-gray-700 dark:text-gray-300' });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete\n    audit trail for every change.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}