import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Spinner_in_buttons($$renderer) {
	Example($$renderer, {
		title: 'In Buttons',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap items-center gap-4">`);

			Button($$renderer, {
				children: ($$renderer) => {
					Spinner($$renderer, { 'data-icon': 'inline-start' });
					$$renderer.push(`<!----> Submit`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				disabled: true,
				children: ($$renderer) => {
					Spinner($$renderer, { 'data-icon': 'inline-start' });
					$$renderer.push(`<!----> Disabled`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				disabled: true,
				children: ($$renderer) => {
					Spinner($$renderer, { 'data-icon': 'inline-start' });
					$$renderer.push(`<!----> Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				size: 'icon',
				disabled: true,
				children: ($$renderer) => {
					Spinner($$renderer, { 'data-icon': 'inline-start' });
					$$renderer.push(`<!----> <span class="sr-only">Loading...</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}