import * as $ from 'svelte/internal/server';
import { goto } from "$app/navigation";
import { page } from "$app/state";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { cn } from "$lib/utils.js";
import { groupItemsByType } from "../lib/utils.js";

export default function Item_explorer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items } = $$props;
		const groupedItems = $.derived(() => groupItemsByType(items));

		if (Sidebar.Root) {
			$$renderer.push('<!--[-->');

			Sidebar.Root($$renderer, {
				class: 'sticky z-30 hidden h-[calc(100svh-var(--header-height)-2rem)] overscroll-none bg-transparent xl:flex',
				collapsible: 'none',
				children: ($$renderer) => {
					if (Sidebar.Content) {
						$$renderer.push('<!--[-->');

						Sidebar.Content($$renderer, {
							class: '-mx-1 no-scrollbar overflow-x-hidden',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(groupedItems());

								for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
									let group = each_array[$$index_1];

									if (Collapsible.Root) {
										$$renderer.push('<!--[-->');

										Collapsible.Root($$renderer, {
											open: true,
											class: 'group/collapsible',
											children: ($$renderer) => {
												if (Sidebar.Group) {
													$$renderer.push('<!--[-->');

													Sidebar.Group($$renderer, {
														class: 'px-1 py-0',
														children: ($$renderer) => {
															if (Collapsible.Trigger) {
																$$renderer.push('<!--[-->');

																Collapsible.Trigger($$renderer, {
																	class: 'flex w-full items-center gap-1 py-1.5 text-[0.8rem] font-medium [&[data-state=open]>svg]:rotate-90',
																	children: ($$renderer) => {
																		ChevronRightIcon($$renderer, { class: 'size-3.5 text-muted-foreground transition-transform' });
																		$$renderer.push(`<!----> <span>${$.escape(group.title)}</span>`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Collapsible.Content) {
																$$renderer.push('<!--[-->');

																Collapsible.Content($$renderer, {
																	children: ($$renderer) => {
																		if (Sidebar.GroupContent) {
																			$$renderer.push('<!--[-->');

																			Sidebar.GroupContent($$renderer, {
																				children: ($$renderer) => {
																					if (Sidebar.Menu) {
																						$$renderer.push('<!--[-->');

																						Sidebar.Menu($$renderer, {
																							class: 'relative ml-1.5 border-l border-border/50 pl-2',
																							children: ($$renderer) => {
																								$$renderer.push(`<!--[-->`);

																								const each_array_1 = $.ensure_array_like(group.items);

																								for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
																									let item = each_array_1[index];

																									if (Sidebar.MenuItem) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuItem($$renderer, {
																											class: 'relative',
																											children: ($$renderer) => {
																												$$renderer.push(`<div${$.attr_class($.clsx(cn("absolute top-1/2 -left-2 h-px w-2 border-t border-border/50", index === group.items.length - 1 && "bg-sidebar")))}></div> `);

																												if (index === group.items.length - 1) {
																													$$renderer.push(`<!--[0--><div class="absolute top-1/2 -bottom-1 -left-2.5 w-1 bg-sidebar"></div>`);
																												} else {
																													$$renderer.push('<!--[-1-->');
																												}

																												$$renderer.push(`<!--]--> `);

																												if (Sidebar.MenuButton) {
																													$$renderer.push('<!--[-->');

																													Sidebar.MenuButton($$renderer, {
																														onclick: () => goto(`/create/${item.name}${page.url.search}`),
																														class: 'relative h-[26px] w-fit cursor-pointer overflow-visible border border-transparent text-[0.8rem] font-normal after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48',
																														'data-active': item.name === page.params.item,
																														isActive: item.name === page.params.item,
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->${$.escape(item.title)} <span class="absolute inset-0 flex w-(--sidebar-width) bg-transparent"></span>`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}

																												$$renderer.push(` <a${$.attr('href', `/preview/${item.name}`)} data-sveltekit-preload-data="hover" class="sr-only"${$.attr('tabindex', -1)}>${$.escape(item.title)}</a>`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}
																								}

																								$$renderer.push(`<!--]-->`);
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

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(`<!--]-->`);
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
	});
}