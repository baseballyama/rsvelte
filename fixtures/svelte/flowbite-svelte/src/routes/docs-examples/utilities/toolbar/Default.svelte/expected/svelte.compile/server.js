import * as $ from 'svelte/internal/server';
import { Toolbar, ToolbarButton } from "flowbite-svelte";
import { HomeOutline, EnvelopeOutline, ImageOutline } from "flowbite-svelte-icons";

export default function Default($$renderer) {
	Toolbar($$renderer, {
		children: ($$renderer) => {
			ToolbarButton($$renderer, {
				children: ($$renderer) => {
					HomeOutline($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToolbarButton($$renderer, {
				children: ($$renderer) => {
					EnvelopeOutline($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToolbarButton($$renderer, {
				children: ($$renderer) => {
					ImageOutline($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}