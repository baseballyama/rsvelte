import * as $ from 'svelte/internal/server';
import { Toolbar, ToolbarButton } from "flowbite-svelte";
import { HomeOutline, EnvelopeOutline, ImageOutline } from "flowbite-svelte-icons";

export default function Colored($$renderer) {
	Toolbar($$renderer, {
		color: 'red',
		children: ($$renderer) => {
			ToolbarButton($$renderer, {
				color: 'red',
				children: ($$renderer) => {
					HomeOutline($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToolbarButton($$renderer, {
				color: 'red',
				children: ($$renderer) => {
					EnvelopeOutline($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToolbarButton($$renderer, {
				color: 'red',
				children: ($$renderer) => {
					ImageOutline($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toolbar($$renderer, {
		color: 'blue',
		children: ($$renderer) => {
			ToolbarButton($$renderer, {
				color: 'blue',
				children: ($$renderer) => {
					HomeOutline($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToolbarButton($$renderer, {
				color: 'blue',
				children: ($$renderer) => {
					EnvelopeOutline($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToolbarButton($$renderer, {
				color: 'blue',
				children: ($$renderer) => {
					ImageOutline($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}