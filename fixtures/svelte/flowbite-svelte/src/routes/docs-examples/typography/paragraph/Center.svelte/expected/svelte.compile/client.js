import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

export default function Center($$anchor) {
	P($$anchor, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have\n  richer contextual information to rapidly respond to requests, incidents, and changes.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}