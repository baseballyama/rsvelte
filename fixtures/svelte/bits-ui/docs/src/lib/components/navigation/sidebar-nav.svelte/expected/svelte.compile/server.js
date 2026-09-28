import * as $ from 'svelte/internal/server';
import { ScrollArea } from "bits-ui";
import SidebarNavItems from "$lib/components/navigation/sidebar-nav-items.svelte";
import SidebarNavMainItems from "$lib/components/navigation/sidebar-nav-main-items.svelte";

export default function Sidebar_nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items = [] } = $$props;

		if (items.length) {
			$$renderer.push(`<!--[0--><aside class="border-border fixed top-[var(--header-height)] hidden h-[calc(100vh-var(--header-height))] w-full shrink-0 border-r md:sticky md:block">`);

			if (ScrollArea.Root) {
				$$renderer.push('<!--[-->');

				ScrollArea.Root($$renderer, {
					children: ($$renderer) => {
						if (ScrollArea.Viewport) {
							$$renderer.push('<!--[-->');

							ScrollArea.Viewport($$renderer, {
								class: 'h-full max-h-[calc(100vh-var(--header-height))] w-full shrink-0 ',
								children: ($$renderer) => {
									$$renderer.push(`<div class="h-full pb-6 pr-4 pt-4 lg:pb-8"><nav class="space-y-3"><div class="flex w-full flex-col pb-[50px]"><!--[-->`);

									const each_array = $.ensure_array_like(items);

									for (let index = 0, $$length = each_array.length; index < $$length; index++) {
										let item = each_array[index];

										if (item.title === "Overview") {
											$$renderer.push('<!--[0-->');
											SidebarNavMainItems($$renderer, { items: item.items });
										} else {
											$$renderer.push(`<!--[-1--><div class="pb-4"><h4 class="text-muted-foreground mb-1 ml-[9px] rounded-md px-2.5 py-2 pl-4 text-xs font-medium uppercase">${$.escape(item.title)}</h4> `);

											if (item.items) {
												$$renderer.push('<!--[0-->');
												SidebarNavItems($$renderer, { items: item.items });
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div>`);
										}

										$$renderer.push(`<!--]-->`);
									}

									$$renderer.push(`<!--]--></div></nav></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (ScrollArea.Scrollbar) {
							$$renderer.push('<!--[-->');

							ScrollArea.Scrollbar($$renderer, {
								orientation: 'vertical',
								class: 'hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex w-2.5 touch-none select-none rounded-full border-l border-l-transparent bg-transparent p-px transition-all duration-200 hover:w-3',
								children: ($$renderer) => {
									if (ScrollArea.Thumb) {
										$$renderer.push('<!--[-->');
										ScrollArea.Thumb($$renderer, { class: 'bg-muted-foreground flex-1 rounded-full' });
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

						$$renderer.push(` `);

						if (ScrollArea.Corner) {
							$$renderer.push('<!--[-->');
							ScrollArea.Corner($$renderer, {});
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

			$$renderer.push(`</aside>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}