import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

export default function Calendars($$renderer, $$props) {
	let { calendars } = $$props;

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(calendars);

	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		let calendar = each_array[index];

		if (Sidebar.Group) {
			$$renderer.push('<!--[-->');

			Sidebar.Group($$renderer, {
				class: 'py-0',
				children: ($$renderer) => {
					if (Collapsible.Root) {
						$$renderer.push('<!--[-->');

						Collapsible.Root($$renderer, {
							open: index === 0,
							class: 'group/collapsible',
							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										if (Collapsible.Trigger) {
											$$renderer.push('<!--[-->');

											Collapsible.Trigger($$renderer, $.spread_props([
												props,
												{
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(calendar.name)} `);

														ChevronRightIcon($$renderer, {
															class: 'ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90'
														});

														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												}
											]));

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									if (Sidebar.GroupLabel) {
										$$renderer.push('<!--[-->');

										Sidebar.GroupLabel($$renderer, {
											class: 'group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
											child,
											$$slots: { child: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
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
																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);

																	const each_array_1 = $.ensure_array_like(calendar.items);

																	for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
																		let item = each_array_1[index];

																		if (Sidebar.MenuItem) {
																			$$renderer.push('<!--[-->');

																			Sidebar.MenuItem($$renderer, {
																				children: ($$renderer) => {
																					if (Sidebar.MenuButton) {
																						$$renderer.push('<!--[-->');

																						Sidebar.MenuButton($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<div${$.attr('data-active', index < 2)} class="group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-xs border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary">`);

																								CheckIcon($$renderer, {
																									class: 'hidden size-3 group-data-[active=true]/calendar-item:block'
																								});

																								$$renderer.push(`<!----></div> ${$.escape(item)}`);
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

		$$renderer.push(` `);

		if (Sidebar.Separator) {
			$$renderer.push('<!--[-->');
			Sidebar.Separator($$renderer, { class: 'mx-0' });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	$$renderer.push(`<!--]-->`);
}