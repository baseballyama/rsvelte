import * as $ from 'svelte/internal/server';
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import PlusIcon from "@lucide/svelte/icons/plus";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { useSidebar } from "$lib/registry/ui/sidebar/index.js";

export default function Team_switcher($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This should be `Component` after @lucide/svelte updates types
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let { teams } = $$props;

		const sidebar = useSidebar();

		// svelte-ignore state_referenced_locally
		let activeTeam = teams[0];

		if (Sidebar.Menu) {
			$$renderer.push('<!--[-->');

			Sidebar.Menu($$renderer, {
				children: ($$renderer) => {
					if (Sidebar.MenuItem) {
						$$renderer.push('<!--[-->');

						Sidebar.MenuItem($$renderer, {
							children: ($$renderer) => {
								if (DropdownMenu.Root) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Root($$renderer, {
										children: ($$renderer) => {
											{
												function child($$renderer, { props }) {
													if (Sidebar.MenuButton) {
														$$renderer.push('<!--[-->');

														Sidebar.MenuButton($$renderer, $.spread_props([
															props,
															{
																size: 'lg',
																class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
																children: ($$renderer) => {
																	$$renderer.push(`<div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">`);

																	if (activeTeam.logo) {
																		$$renderer.push('<!--[-->');
																		activeTeam.logo($$renderer, { class: 'size-4' });
																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(`</div> <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium">${$.escape(activeTeam.name)}</span> <span class="truncate text-xs">${$.escape(activeTeam.plan)}</span></div> `);
																	ChevronsUpDownIcon($$renderer, { class: 'ms-auto' });
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

												if (DropdownMenu.Trigger) {
													$$renderer.push('<!--[-->');
													DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											$$renderer.push(` `);

											if (DropdownMenu.Content) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Content($$renderer, {
													class: 'w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg',
													align: 'start',
													side: sidebar.isMobile ? "bottom" : "right",
													sideOffset: 4,
													children: ($$renderer) => {
														if (DropdownMenu.Label) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Label($$renderer, {
																class: 'text-xs text-muted-foreground',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Teams`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <!--[-->`);

														const each_array = $.ensure_array_like(teams);

														for (let index = 0, $$length = each_array.length; index < $$length; index++) {
															let team = each_array[index];

															if (DropdownMenu.Item) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Item($$renderer, {
																	onSelect: () => activeTeam = team,
																	class: 'gap-2 p-2',
																	children: ($$renderer) => {
																		$$renderer.push(`<div class="flex size-6 items-center justify-center rounded-md border">`);

																		if (team.logo) {
																			$$renderer.push('<!--[-->');
																			team.logo($$renderer, { class: 'size-3.5 shrink-0' });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(`</div> ${$.escape(team.name)} `);

																		if (DropdownMenu.Shortcut) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.Shortcut($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->⌘${$.escape(index + 1)}`);
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

														$$renderer.push(`<!--]--> `);

														if (DropdownMenu.Separator) {
															$$renderer.push('<!--[-->');
															DropdownMenu.Separator($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DropdownMenu.Item) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Item($$renderer, {
																class: 'gap-2 p-2',
																children: ($$renderer) => {
																	$$renderer.push(`<div class="flex size-6 items-center justify-center rounded-md border bg-transparent">`);
																	PlusIcon($$renderer, { class: 'size-4' });
																	$$renderer.push(`<!----></div> <div class="font-medium text-muted-foreground">Add team</div>`);
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
	});
}