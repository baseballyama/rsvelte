import * as $ from 'svelte/internal/server';
import { Layout, P } from "$lib";

export default function ThreeColumnsEven($$renderer) {
	P($$renderer, {
		weight: 'light',
		class: 'mb-3 text-gray-900 dark:text-white',
		contenteditable: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have
  richer contextual information to rapidly respond to requests, incidents, and changes.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Layout($$renderer, {
		class: 'grid-cols-1 gap-6 sm:grid-cols-3',
		children: ($$renderer) => {
			P($$renderer, {
				weight: 'light',
				class: 'mb-3 text-gray-900 dark:text-white',
				contenteditable: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams
    have richer contextual information to rapidly respond to requests, incidents, and changes.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			P($$renderer, {
				weight: 'light',
				class: 'mb-3 text-gray-900 dark:text-white',
				contenteditable: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete
    audit trail for every change.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			P($$renderer, {
				weight: 'light',
				class: 'mb-3 text-gray-900 dark:text-white',
				contenteditable: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete
    audit trail for every change.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		weight: 'light',
		class: 'mb-3 text-gray-900 dark:text-white',
		contenteditable: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete
  audit trail for every change.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}