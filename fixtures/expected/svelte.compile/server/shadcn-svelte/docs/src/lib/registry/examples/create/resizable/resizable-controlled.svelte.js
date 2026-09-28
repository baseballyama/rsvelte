import * as $ from 'svelte/internal/server';
import * as Resizable from "$lib/registry/ui/resizable/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Resizable_controlled($$renderer) {
	let sizes = [30, 70];

	Example($$renderer, {
		title: 'Controlled',
		children: ($$renderer) => {
			if (Resizable.PaneGroup) {
				$$renderer.push('<!--[-->');

				Resizable.PaneGroup($$renderer, {
					direction: 'horizontal',
					class: 'min-h-[200px] rounded-lg border',
					onLayoutChange: (newSizes) => {
						sizes = newSizes;
					},

					children: ($$renderer) => {
						if (Resizable.Pane) {
							$$renderer.push('<!--[-->');

							Resizable.Pane($$renderer, {
								defaultSize: 30,
								minSize: 20,
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex h-full flex-col items-center justify-center gap-2 p-6"><span class="font-semibold">${$.escape(Math.round(sizes[0] ?? 30))}%</span></div>`);
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
							Resizable.Handle($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Resizable.Pane) {
							$$renderer.push('<!--[-->');

							Resizable.Pane($$renderer, {
								defaultSize: 70,
								minSize: 30,
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex h-full flex-col items-center justify-center gap-2 p-6"><span class="font-semibold">${$.escape(Math.round(sizes[1] ?? 70))}%</span></div>`);
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