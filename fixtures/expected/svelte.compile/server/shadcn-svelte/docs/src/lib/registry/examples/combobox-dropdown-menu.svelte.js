import * as $ from 'svelte/internal/server';
import CalendarIcon from "@lucide/svelte/icons/calendar";
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import TagsIcon from "@lucide/svelte/icons/tags";
import TrashIcon from "@lucide/svelte/icons/trash";
import UserIcon from "@lucide/svelte/icons/user";
import { tick } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Combobox_dropdown_menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const labels = [
			"feature",
			"bug",
			"enhancement",
			"documentation",
			"design",
			"question",
			"maintenance"
		];

		let open = false;
		let selectedLabel = "feature";
		let triggerRef = null;

		// We want to refocus the trigger button when the user selects
		// an item from the list so users can continue navigating the
		// rest of the form with the keyboard.
		function closeAndFocusTrigger() {
			open = false;

			tick().then(() => {
				triggerRef.focus();
			});
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex w-full flex-col items-start justify-between rounded-md border px-4 py-3 sm:flex-row sm:items-center"><p class="text-sm leading-none font-medium"><span class="me-2 rounded-lg bg-primary px-2 py-1 text-xs text-primary-foreground">${$.escape(selectedLabel)}</span> <span class="text-muted-foreground">Create a new project</span></p> `);

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'ghost', size: 'sm' },
									props,
									{
										'aria-label': 'Open menu',
										children: ($$renderer) => {
											EllipsisIcon($$renderer, {});
										},
										$$slots: { default: true }
									}
								]));
							}

							if (DropdownMenu.Trigger) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Trigger($$renderer, {
									get ref() {
										return triggerRef;
									},

									set ref($$value) {
										triggerRef = $$value;
										$$settled = false;
									},
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

						if (DropdownMenu.Content) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Content($$renderer, {
								class: 'w-[200px]',
								align: 'end',
								children: ($$renderer) => {
									if (DropdownMenu.Group) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (DropdownMenu.Label) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Label($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Actions`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														children: ($$renderer) => {
															UserIcon($$renderer, { class: 'me-2 size-4' });
															$$renderer.push(`<!----> Assign to...`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														children: ($$renderer) => {
															CalendarIcon($$renderer, { class: 'me-2 size-4' });
															$$renderer.push(`<!----> Set due date...`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DropdownMenu.Separator) {
													$$renderer.push('<!--[-->');
													DropdownMenu.Separator($$renderer, {});
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DropdownMenu.Sub) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Sub($$renderer, {
														children: ($$renderer) => {
															if (DropdownMenu.SubTrigger) {
																$$renderer.push('<!--[-->');

																DropdownMenu.SubTrigger($$renderer, {
																	children: ($$renderer) => {
																		TagsIcon($$renderer, { class: 'me-2 size-4' });
																		$$renderer.push(`<!----> Apply label`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (DropdownMenu.SubContent) {
																$$renderer.push('<!--[-->');

																DropdownMenu.SubContent($$renderer, {
																	class: 'p-0',
																	children: ($$renderer) => {
																		if (Command.Root) {
																			$$renderer.push('<!--[-->');

																			Command.Root($$renderer, {
																				value: selectedLabel,
																				children: ($$renderer) => {
																					if (Command.Input) {
																						$$renderer.push('<!--[-->');
																						Command.Input($$renderer, { autofocus: true, placeholder: 'Filter label...' });
																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					if (Command.List) {
																						$$renderer.push('<!--[-->');

																						Command.List($$renderer, {
																							children: ($$renderer) => {
																								if (Command.Empty) {
																									$$renderer.push('<!--[-->');

																									Command.Empty($$renderer, {
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->No label found.`);
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}

																								$$renderer.push(` `);

																								if (Command.Group) {
																									$$renderer.push('<!--[-->');

																									Command.Group($$renderer, {
																										children: ($$renderer) => {
																											$$renderer.push(`<!--[-->`);

																											const each_array = $.ensure_array_like(labels);

																											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																												let label = each_array[$$index];

																												if (Command.Item) {
																													$$renderer.push('<!--[-->');

																													Command.Item($$renderer, {
																														value: label,
																														onSelect: () => {
																															selectedLabel = label;
																															closeAndFocusTrigger();
																														},

																														children: ($$renderer) => {
																															$$renderer.push(`<!---->${$.escape(label)}`);
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
														class: 'text-red-600',
														children: ($$renderer) => {
															TrashIcon($$renderer, { class: 'me-2 size-4' });
															$$renderer.push(`<!----> Delete `);

															if (DropdownMenu.Shortcut) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Shortcut($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->⌘⌫`);
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

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}