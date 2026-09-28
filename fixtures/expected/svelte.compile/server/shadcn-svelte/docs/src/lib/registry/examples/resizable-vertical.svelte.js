import * as $ from 'svelte/internal/server';
import * as Resizable from "$lib/registry/ui/resizable/index.js";

export default function Resizable_vertical($$renderer) {
	if (Resizable.PaneGroup) {
		$$renderer.push('<!--[-->');

		Resizable.PaneGroup($$renderer, {
			direction: 'vertical',
			class: 'min-h-[200px] max-w-md rounded-lg border',
			children: ($$renderer) => {
				if (Resizable.Pane) {
					$$renderer.push('<!--[-->');

					Resizable.Pane($$renderer, {
						defaultSize: 25,
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex h-full items-center justify-center p-6"><span class="font-semibold">Header</span></div>`);
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
}