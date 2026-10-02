import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Spinner_in_badges($$renderer) {
	Example($$renderer, {
		title: 'In Badges',
		class: 'items-center justify-center',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap items-center justify-center gap-4">`);

			Badge($$renderer, {
				children: ($$renderer) => {
					Spinner($$renderer, { 'data-icon': 'inline-start' });
					$$renderer.push(`<!----> Badge`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'secondary',
				children: ($$renderer) => {
					Spinner($$renderer, { 'data-icon': 'inline-start' });
					$$renderer.push(`<!----> Badge`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'destructive',
				children: ($$renderer) => {
					Spinner($$renderer, { 'data-icon': 'inline-start' });
					$$renderer.push(`<!----> Badge`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					Spinner($$renderer, { 'data-icon': 'inline-start' });
					$$renderer.push(`<!----> Badge`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}