import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

var root = $.from_html(`Track work across the enterprise through an open, collaborative platform. <strong class="font-semibold text-gray-900 dark:text-white">Link issues across Jira</strong> and ingest data from other software development tools, so your IT support and operations teams have richer contextual information to rapidly respond to requests, incidents, and changes.`, 1);

export default function Bold($$anchor) {
	P($$anchor, {
		class: 'mb-3',
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}