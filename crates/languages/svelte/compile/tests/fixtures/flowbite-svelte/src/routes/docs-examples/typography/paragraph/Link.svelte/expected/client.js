import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P, A } from "flowbite-svelte";

var root = $.from_html(
	`Track work across the enterprise through an open, collaborative platform. <!> and ingest data from other software development tools, so your IT support and operations
  teams have richer contextual information to rapidly respond to requests, incidents, and changes.`,
	1
);

export default function Link($$anchor) {
	P($$anchor, {
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			A(node, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Link issues across Jira');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}