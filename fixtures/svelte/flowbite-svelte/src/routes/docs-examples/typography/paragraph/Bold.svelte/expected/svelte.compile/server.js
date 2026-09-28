import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function Bold($$renderer) {
	P($$renderer, {
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform. <strong class="font-semibold text-gray-900 dark:text-white">Link issues across Jira</strong> and ingest data from other software development tools, so your IT support and operations teams have richer contextual information to rapidly respond to requests, incidents, and changes.`);
		},
		$$slots: { default: true }
	});
}