import * as $ from 'svelte/internal/server';
import { P, Layout } from "flowbite-svelte";

export default function TwoUnevenColumns($$renderer) {
	P($$renderer, {
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
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
			$$renderer.push(`<div class="col-span-2">`);

			P($$renderer, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams
      have richer contextual information to rapidly respond to requests, incidents, and changes.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			P($$renderer, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete
      audit trail for every change.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			P($$renderer, {
				class: 'mb-3',
				weight: 'light',
				color: 'text-gray-500 dark:text-gray-400',
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
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease, with a complete
  audit trail for every change.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}