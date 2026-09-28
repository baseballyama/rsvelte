import * as $ from 'svelte/internal/server';
import { Popover, Separator } from "bits-ui";
import ScrollArea from "$lib/components/ui/scroll-area.svelte";
import { parseMarkdown } from "$lib/utils/index.js";
import PopoverContent from "$lib/components/ui/popover/popover-content.svelte";
import Info from "phosphor-svelte/lib/Info";

export default function Css_vars_details_mobile($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { cssVar } = $$props;

		if (Popover.Root) {
			$$renderer.push('<!--[-->');

			Popover.Root($$renderer, {
				children: ($$renderer) => {
					if (Popover.Trigger) {
						$$renderer.push('<!--[-->');

						Popover.Trigger($$renderer, {
							'data-llm-ignore': true,
							class: 'rounded-button text-muted-foreground focus-visible:ring-foreground focus-visible:ring-offset-background extend-touch-target focus-visible:outline-hidden inline-flex h-full w-full items-center justify-end px-2 py-3 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
							children: ($$renderer) => {
								Info($$renderer, { class: 'size-4', weight: 'bold' });
								$$renderer.push(`<!----> <span class="sr-only">CSS Variable details</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					PopoverContent($$renderer, {
						preventScroll: false,
						side: 'left',
						sideOffset: 0,
						align: 'center',
						class: 'flex max-h-[80vh] w-[85vw] max-w-[85vw] flex-col gap-4',
						avoidCollisions: true,
						collisionPadding: { top: 70 },
						onCloseAutoFocus: (e) => e.preventDefault(),
						trapFocus: false,
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex w-full items-center"><span class="text-sm font-semibold">${$.escape(cssVar.name)}</span></div> `);

							if (Separator.Root) {
								$$renderer.push('<!--[-->');
								Separator.Root($$renderer, { class: 'dark:bg-dark-10 bg-border !h-px w-full ' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <div class="flex w-full flex-col gap-2"><span class="text-foreground text-left font-semibold">Description</span> `);

							ScrollArea($$renderer, {
								type: 'scroll',
								class: 'text-foreground/85 max-h-[200px] min-w-full p-0 text-left text-sm leading-relaxed',
								scrollbarXProps: { class: "h-1.5" },
								scrollbarYProps: { class: "w-1.5 -mr-2" },
								children: ($$renderer) => {
									$$renderer.push(`<div class="w-full pr-[2.5px] leading-7">${$.html(parseMarkdown(cssVar.description))}</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <span aria-hidden="true" class="hidden"></span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}