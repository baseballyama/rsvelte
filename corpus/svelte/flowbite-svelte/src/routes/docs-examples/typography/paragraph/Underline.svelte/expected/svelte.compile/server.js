import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function Underline($$renderer) {
	P($$renderer, {
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform. <u class="underline">Link issues across Jira</u> and ingest data from other software development tools, so your IT support and operations teams have richer contextual information to rapidly respond to requests, incidents, and changes.`);
		},
		$$slots: { default: true }
	});
}