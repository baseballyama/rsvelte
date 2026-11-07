import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function Center($$renderer) {
	P($$renderer, {
		align: 'center',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have
  richer contextual information to rapidly respond to requests, incidents, and changes.`);
		},
		$$slots: { default: true }
	});
}