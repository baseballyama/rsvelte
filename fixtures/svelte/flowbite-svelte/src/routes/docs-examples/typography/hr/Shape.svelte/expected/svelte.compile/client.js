import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Hr, P, Blockquote } from "flowbite-svelte";

var root = $.from_html(`<p>"Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to complex dashboard. Perfect choice for your next SaaS application."</p>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Shape($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	P(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have\n  richer contextual information to rapidly respond to requests, incidents, and changes.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Hr(node_1, { class: 'mx-auto h-8 w-8' });

	var node_2 = $.sibling(node_1, 2);

	Blockquote(node_2, {
		alignment: 'center',
		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}