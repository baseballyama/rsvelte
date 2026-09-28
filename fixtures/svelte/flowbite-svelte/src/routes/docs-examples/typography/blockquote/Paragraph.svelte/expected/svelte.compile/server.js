import * as $ from 'svelte/internal/server';
import { Blockquote, P } from "flowbite-svelte";

export default function Paragraph($$renderer) {
	P($$renderer, {
		class: 'mb-3',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have
  richer contextual information to rapidly respond to requests, incidents, and changes.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="grid grid-cols-1 md:grid-cols-2 md:gap-6">`);

	P($$renderer, {
		class: 'mb-3',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams
    have richer contextual information to rapidly respond to requests, incidents, and changes.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Blockquote($$renderer, {
		class: 'mb-3',
		size: 'xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->" Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to complex dashboard. Perfect choice for your next SaaS application. "`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	P($$renderer, {
		class: 'mb-3',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete
  audit trail for every change.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}