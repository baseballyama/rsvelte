import * as $ from 'svelte/internal/server';
import * as Resizable from "$lib/registry/ui/resizable/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Resizable_with_handle($$renderer) {
	Example($$renderer, {
		title: 'With Handle',
		children: ($$renderer) => {
			if (Resizable.PaneGroup) {
				$$renderer.push('<!--[-->');

				Resizable.PaneGroup($$renderer, {
					direction: 'horizontal',
					class: 'min-h-[200px] rounded-lg border',
					children: ($$renderer) => {
						if (Resizable.Pane) {
							$$renderer.push('<!--[-->');

							Resizable.Pane($$renderer, {
								defaultSize: 25,
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex h-full items-center justify-center p-6"><span class="font-semibold">Sidebar</span></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Resizable.Handle) {
							$$renderer.push('<!--[-->');
							Resizable.Handle($$renderer, { withHandle: true });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Resizable.Pane) {
							$$renderer.push('<!--[-->');

							Resizable.Pane($$renderer, {
								defaultSize: 75,
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex h-full items-center justify-center p-6"><span class="font-semibold">Content</span></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}