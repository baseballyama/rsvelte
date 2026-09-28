import * as $ from 'svelte/internal/server';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import PlusIcon from "@lucide/svelte/icons/plus";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

export default function Team_switcher($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { teams

		// This should be `Component` after @lucide/svelte updates types
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		 } = $$props;

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
																class: 'w-fit px-1.5',
																children: ($$renderer) => {
																	$$renderer.push(`<div class="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">`);

																	if (activeTeam.logo) {
																		$$renderer.push('<!--[-->');
																		activeTeam.logo($$renderer, { class: 'size-3' });
																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(`</div> <span class="truncate font-medium">${$.escape(activeTeam.name)}</span> `);
																	ChevronDownIcon($$renderer, { class: 'opacity-50' });
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
													class: 'w-64 rounded-lg',
													align: 'start',
													side: 'bottom',
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
																		$$renderer.push(`<div class="flex size-6 items-center justify-center rounded-sm border">`);

																		if (team.logo) {
																			$$renderer.push('<!--[-->');
																			team.logo($$renderer, { class: 'size-4 shrink-0' });
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
																	$$renderer.push(`<div class="flex size-6 items-center justify-center rounded-md border bg-background">`);
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