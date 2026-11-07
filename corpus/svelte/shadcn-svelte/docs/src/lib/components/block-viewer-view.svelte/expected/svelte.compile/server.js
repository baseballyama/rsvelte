import * as $ from 'svelte/internal/server';
import * as Resizable from "$lib/registry/ui/resizable/index.js";
import BlockViewerIframe from "./block-viewer-iframe.svelte";
import { BlockViewerContext } from "./block-viewer.svelte";

export default function Block_viewer_view($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = BlockViewerContext.get();

		$$renderer.push(`<div class="hidden group-data-[view=code]/block-view-wrapper:hidden md:h-(--height) lg:flex"><div class="relative grid w-full gap-4"><div class="absolute inset-0 end-4 bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] bg-size-[20px_20px] dark:bg-[radial-gradient(#404040_1px,transparent_1px)]"></div> `);

		if (Resizable.PaneGroup) {
			$$renderer.push('<!--[-->');

			Resizable.PaneGroup($$renderer, {
				direction: 'horizontal',
				class: 'relative z-10 after:absolute after:inset-0 after:end-3 after:z-0 after:rounded-xl after:bg-surface/50',
				children: ($$renderer) => {
					if (Resizable.Pane) {
						$$renderer.push('<!--[-->');

						Resizable.Pane($$renderer, {
							class: 'relative aspect-[4/2.5] overflow-hidden rounded-lg border bg-background md:aspect-auto md:rounded-xl',
							defaultSize: 100,
							minSize: 30,
							children: ($$renderer) => {
								BlockViewerIframe($$renderer, {});
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

						Resizable.Handle($$renderer, {
							class: 'relative z-20 hidden w-3 bg-transparent p-0 after:absolute after:end-0 after:top-1/2 after:h-8 after:w-[6px] after:-translate-x-px after:-translate-y-1/2 after:rounded-full after:bg-border after:transition-all after:hover:h-10 md:block'
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Resizable.Pane) {
						$$renderer.push('<!--[-->');
						Resizable.Pane($$renderer, { defaultSize: 0, minSize: 0 });
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

		$$renderer.push(`</div></div>`);
	});
}