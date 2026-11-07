import * as $ from 'svelte/internal/server';
import { Hr, P } from "flowbite-svelte";
import { QuoteSolid } from "flowbite-svelte-icons";

export default function Icon($$renderer) {
	$$renderer.push(`<div class="text-center">`);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams
    have richer contextual information to rapidly respond to requests, incidents, and changes.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Hr($$renderer, {
		class: 'h-1 w-64',
		children: ($$renderer) => {
			QuoteSolid($$renderer, { class: 'h-6 w-6 text-gray-700 dark:text-gray-300' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete
    audit trail for every change.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}