import * as $ from 'svelte/internal/server';
import { Hr, P, Blockquote } from "flowbite-svelte";

export default function Shape($$renderer) {
	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have
  richer contextual information to rapidly respond to requests, incidents, and changes.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Hr($$renderer, { class: 'mx-auto h-8 w-8' });
	$$renderer.push(`<!----> `);

	Blockquote($$renderer, {
		alignment: 'center',
		children: ($$renderer) => {
			$$renderer.push(`<p>"Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to complex dashboard. Perfect choice for your next SaaS application."</p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}