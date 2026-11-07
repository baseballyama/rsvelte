import * as $ from 'svelte/internal/server';
import { P, A } from "flowbite-svelte";

export default function Link($$renderer) {
	P($$renderer, {
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform. `);

			A($$renderer, {
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link issues across Jira`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> and ingest data from other software development tools, so your IT support and operations
  teams have richer contextual information to rapidly respond to requests, incidents, and changes.`);
		},
		$$slots: { default: true }
	});
}