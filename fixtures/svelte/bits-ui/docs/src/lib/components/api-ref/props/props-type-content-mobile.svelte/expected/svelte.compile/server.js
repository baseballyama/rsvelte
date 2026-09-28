import * as $ from 'svelte/internal/server';
import { Popover, Separator } from "bits-ui";
import ScrollArea from "$lib/components/ui/scroll-area.svelte";
import Info from "phosphor-svelte/lib/Info";
import PropsRequiredBadge from "./props-required-badge.svelte";
import PropsBindableBadge from "./props-bindable-badge.svelte";
import Code from "$lib/components/markdown/code.svelte";
import { parseMarkdown } from "$lib/utils/markdown.js";
import PopoverContent from "$lib/components/ui/popover/popover-content.svelte";

export default function Props_type_content_mobile($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { prop } = $$props;

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
								$$renderer.push(`<!----> <span class="sr-only">See type definition</span>`);
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
							$$renderer.push(`<div class="flex w-full items-center justify-between gap-2"><span class="font-semibold">${$.escape(prop.name)}</span> <div class="flex items-center gap-1.5">`);

							if (prop.required) {
								$$renderer.push('<!--[0-->');
								PropsRequiredBadge($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (prop.bindable) {
								$$renderer.push('<!--[0-->');
								PropsBindableBadge($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div></div> `);

							if (prop.type.variant === "simple") {
								$$renderer.push('<!--[0-->');

								Code($$renderer, {
									class: 'h-auto w-full justify-start px-2 py-2 text-start text-sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(prop.type.type)}`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');

								ScrollArea($$renderer, {
									type: 'scroll',
									class: 'bg-muted rounded-button flex max-h-[200px] min-w-full p-2',
									scrollbarXProps: { class: "h-1.5" },
									scrollbarYProps: { class: "w-1.5" },
									children: ($$renderer) => {
										$$renderer.push(`<div class="**:data-line:pr-2.5! [&amp;_pre]:my-0! [&amp;_pre]:mb-0! [&amp;_pre]:overflow-x-visible! [&amp;_pre]:pt-0! [&amp;_pre]:pb-0! [&amp;_pre]:ring-0! [&amp;_pre]:ring-offset-0! [&amp;_pre]:outline-hidden! w-full !text-xs [&amp;_[data-line]]:!pl-0 [&amp;_[data-line]]:!text-xs [&amp;_code]:text-start [&amp;_pre]:mt-0 [&amp;_pre]:border-0 [&amp;_pre]:p-0">`);

										if (prop.type.definition) {
											$$renderer.push('<!--[-->');
											prop.type.definition($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(`</div>`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]--> `);

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
									$$renderer.push(`<div class="w-full pr-[2.5px] leading-7">${$.html(parseMarkdown(prop.description))}</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
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