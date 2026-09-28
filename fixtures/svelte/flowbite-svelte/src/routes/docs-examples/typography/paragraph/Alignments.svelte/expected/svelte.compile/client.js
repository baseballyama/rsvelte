import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Alignments($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		align: 'left',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have\n  richer contextual information to rapidly respond to requests, incidents, and changes.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have\n  richer contextual information to rapidly respond to requests, incidents, and changes.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		align: 'right',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have\n  richer contextual information to rapidly respond to requests, incidents, and changes.');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}