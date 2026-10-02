import * as $ from 'svelte/internal/server';
import { Toolbar, ToolbarButton, ToolbarGroup } from "flowbite-svelte";
import { HomeOutline, EnvelopeOutline, ImageOutline, CogOutline } from "flowbite-svelte-icons";

export default function Groups($$renderer) {
	{
		function end($$renderer) {
			ToolbarButton($$renderer, {
				color: 'green',
				children: ($$renderer) => {
					CogOutline($$renderer, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		}

		Toolbar($$renderer, {
			color: 'green',
			end,
			children: ($$renderer) => {
				ToolbarGroup($$renderer, {
					children: ($$renderer) => {
						ToolbarButton($$renderer, {
							color: 'green',
							children: ($$renderer) => {
								HomeOutline($$renderer, { class: 'h-6 w-6' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							color: 'green',
							children: ($$renderer) => {
								EnvelopeOutline($$renderer, { class: 'h-6 w-6' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							color: 'green',
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

				ToolbarGroup($$renderer, {
					children: ($$renderer) => {
						ToolbarButton($$renderer, {
							color: 'green',
							children: ($$renderer) => {
								HomeOutline($$renderer, { class: 'h-6 w-6' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							color: 'green',
							children: ($$renderer) => {
								EnvelopeOutline($$renderer, { class: 'h-6 w-6' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							color: 'green',
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
			},
			$$slots: { end: true, default: true }
		});
	}
}