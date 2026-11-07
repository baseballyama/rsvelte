import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Badge_examples($$renderer) {
	Example($$renderer, {
		title: 'Badge',
		class: 'items-center justify-center',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center justify-center gap-2">`);

			Badge($$renderer, {
				children: ($$renderer) => {
					Spinner($$renderer, { 'data-icon': 'inline-start' });
					$$renderer.push(`<!----> Syncing`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'secondary',
				children: ($$renderer) => {
					Spinner($$renderer, { 'data-icon': 'inline-start' });
					$$renderer.push(`<!----> Updating`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					Spinner($$renderer, { 'data-icon': 'inline-start' });
					$$renderer.push(`<!----> Loading`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'link',
				class: 'hidden sm:flex',
				children: ($$renderer) => {
					Spinner($$renderer, { 'data-icon': 'inline-start' });
					$$renderer.push(`<!----> Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}