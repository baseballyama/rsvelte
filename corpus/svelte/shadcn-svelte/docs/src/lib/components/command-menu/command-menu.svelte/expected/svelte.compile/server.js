import * as $ from 'svelte/internal/server';
import { goto } from "$app/navigation";
import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
import CornerDownLeftIcon from "@lucide/svelte/icons/corner-down-left";
import SquareDashedIcon from "@lucide/svelte/icons/square-dashed";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { mainNavItems, sidebarNavItems } from "$lib/navigation.js";
import { getCommand } from "$lib/package-manager.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { UserConfigContext } from "$lib/user-config.svelte.js";
import { cn } from "$lib/utils.js";
import CommandMenuItem from "./command-menu-item.svelte";

export default function Command_menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { colors, blocks, closeMobileMenu } = $$props;
		let open = false;
		let selectedType = null;
		let copyPayload = "";
		const userConfig = UserConfigContext.get();
		const clipboard = new UseClipboard();

		const COMMAND_MENU_GROUP_ORDER = [
			"Components",
			"Get Started",
			"Installation",
			"Dark Mode",
			"Registry",
			"Forms",
			"Migration"
		];

		const orderedSidebarGroups = $.derived(() => COMMAND_MENU_GROUP_ORDER.map((title) => sidebarNavItems.find((group) => group.title === title)).filter((group) => group !== undefined));

		function handlePageHighlight(isComponent, item) {
			if (isComponent) {
				const componentName = item.href.split("/").pop();

				selectedType = "component";

				const cmd = getCommand(userConfig.current.packageManager, "execute", `shadcn-svelte add ${componentName}`);

				copyPayload = `${cmd.command} ${cmd.args.join(" ")}`.trim();
			} else {
				selectedType = "page";
				copyPayload = "";
			}
		}

		function handleBlockHighlight(block) {
			selectedType = "block";

			const cmd = getCommand(userConfig.current.packageManager, "execute", `shadcn-svelte add ${block.name}`);

			copyPayload = `${cmd.command} ${cmd.args.join(" ")}`.trim();
		}

		function handleColorHighlight(color) {
			selectedType = "color";
			copyPayload = color.class;
		}

		function runCommand(command) {
			open = false;
			command();
		}

		function openCommandMenu() {
			// Close mobile menu first if callback is provided
			if (closeMobileMenu) {
				closeMobileMenu();

				// Wait for the mobile menu animation to start closing (100ms matches the transition duration)
				setTimeout(
					() => {
						open = true;
					},
					0
				);
			} else {
				open = true;
			}
		}

		function handleKeydown(e) {
			if (e.key === "k" && (e.metaKey || e.ctrlKey) || e.key === "/") {
				if (e.target instanceof HTMLElement && e.target.isContentEditable || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
					return;
				}

				e.preventDefault();

				if (open) {
					open = false;
				} else {
					openCommandMenu();
				}
			}

			if (open && e.key === "c" && (e.metaKey || e.ctrlKey)) {
				runCommand(() => {
					if (selectedType === "color") {
						clipboard.copy(copyPayload);
					}

					if (selectedType === "block") {
						clipboard.copy(copyPayload);
					}

					if (selectedType === "page" || selectedType === "component") {
						clipboard.copy(copyPayload);
					}
				});
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
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
									props,
									{
										variant: 'outline',
										class: cn("relative h-8 w-full justify-start rounded-lg border-none bg-muted pl-3 text-foreground shadow-none transition-colors hover:bg-muted/50 md:w-48 lg:w-40 xl:w-64 dark:bg-card"),
										onclick: () => openCommandMenu(),
										children: ($$renderer) => {
											$$renderer.push(`<span class="hidden xl:inline-flex">Search documentation...</span> <span class="inline-flex xl:hidden">Search...</span>`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Dialog.Trigger) {
								$$renderer.push('<!--[-->');
								Dialog.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								showCloseButton: false,
								class: 'rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											class: 'sr-only',
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Search documentation...`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Search for a command to run...`);
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

									if (Command.Root) {
										$$renderer.push('<!--[-->');

										Command.Root($$renderer, {
											class: 'rounded-none bg-transparent',
											children: ($$renderer) => {
												if (Command.Input) {
													$$renderer.push('<!--[-->');
													Command.Input($$renderer, { placeholder: 'Search documentation...' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Command.List) {
													$$renderer.push('<!--[-->');

													Command.List($$renderer, {
														tabindex: -1,
														class: 'no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5',
														children: ($$renderer) => {
															if (Command.Empty) {
																$$renderer.push('<!--[-->');

																Command.Empty($$renderer, {
																	class: 'py-12 text-center text-sm text-muted-foreground',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->No results found.`);
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
																	heading: 'Pages',
																	class: '!p-0 [&_[data-command-group-heading]]:scroll-mt-16 [&_[data-command-group-heading]]:!p-3 [&_[data-command-group-heading]]:!pb-1',
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array = $.ensure_array_like(mainNavItems);

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let item = each_array[$$index];

																			CommandMenuItem($$renderer, {
																				value: `Pages ${item.title}`,
																				keywords: ["page", item.title.toLowerCase()],
																				onHighlight: () => handlePageHighlight(false, { href: item.href ?? "", title: item.title }),
																				onSelect: () => {
																					runCommand(() => {
																						if (item.href) {
																							goto(item.href);
																						}
																					});
																				},

																				children: ($$renderer) => {
																					ArrowRightIcon($$renderer, {});
																					$$renderer.push(`<!----> ${$.escape(item.title)}`);
																				},
																				$$slots: { default: true }
																			});
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

															$$renderer.push(` <!--[-->`);

															const each_array_1 = $.ensure_array_like(orderedSidebarGroups());

															for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
																let group = each_array_1[$$index_2];

																if (Command.Group) {
																	$$renderer.push('<!--[-->');

																	Command.Group($$renderer, {
																		heading: group.title,
																		class: '!p-0 [&_[data-command-group-heading]]:scroll-mt-16 [&_[data-command-group-heading]]:!p-3 [&_[data-command-group-heading]]:!pb-1',
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_2 = $.ensure_array_like(group.items);

																			for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
																				let item = each_array_2[i];
																				const isComponent = item.href?.includes("/components/") ?? false;

																				CommandMenuItem($$renderer, {
																					value: item.title?.toString() ? `${group.title} ${item.title}` : "",
																					keywords: isComponent ? ["component"] : undefined,
																					onHighlight: () => handlePageHighlight(isComponent, { href: item.href ?? "", title: item.title }),
																					onSelect: () => {
																						runCommand(() => {
																							if (item.href) {
																								goto(item.href);
																							}
																						});
																					},

																					children: ($$renderer) => {
																						if (isComponent) {
																							$$renderer.push(`<!--[0--><div class="aspect-square size-4 rounded-full border border-dashed border-muted-foreground"></div>`);
																						} else {
																							$$renderer.push('<!--[-1-->');
																							ArrowRightIcon($$renderer, {});
																						}

																						$$renderer.push(`<!--]--> ${$.escape(item.title)}`);
																					},
																					$$slots: { default: true }
																				});
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
															}

															$$renderer.push(`<!--]--> `);

															if (blocks?.length) {
																$$renderer.push('<!--[0-->');

																if (Command.Group) {
																	$$renderer.push('<!--[-->');

																	Command.Group($$renderer, {
																		heading: 'Blocks',
																		class: '!p-0 [&_[data-command-group-heading]]:!p-3',
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_3 = $.ensure_array_like(blocks);

																			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																				let block = each_array_3[$$index_3];

																				CommandMenuItem($$renderer, {
																					value: block.name,
																					onHighlight: () => handleBlockHighlight(block),
																					keywords: ["block", block.name, block.description, ...block.categories],
																					onSelect: () => {
																						runCommand(() => {
																							goto(`/blocks/${block.categories[0]}#${block.name}`);
																						});
																					},

																					children: ($$renderer) => {
																						SquareDashedIcon($$renderer, {});
																						$$renderer.push(`<!----> ${$.escape(block.description)} <span class="ms-auto font-mono text-xs font-normal text-muted-foreground tabular-nums">${$.escape(block.name)}</span>`);
																					},
																					$$slots: { default: true }
																				});
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
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--> <!--[-->`);

															const each_array_4 = $.ensure_array_like(colors);

															for (let $$index_5 = 0, $$length = each_array_4.length; $$index_5 < $$length; $$index_5++) {
																let colorPalette = each_array_4[$$index_5];

																if (Command.Group) {
																	$$renderer.push('<!--[-->');

																	Command.Group($$renderer, {
																		heading: colorPalette.name.charAt(0).toUpperCase() + colorPalette.name.slice(1),
																		class: '!p-0 [&_[data-command-group-heading]]:!p-3',
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_5 = $.ensure_array_like(colorPalette.colors);

																			for (let $$index_4 = 0, $$length = each_array_5.length; $$index_4 < $$length; $$index_4++) {
																				let color = each_array_5[$$index_4];

																				CommandMenuItem($$renderer, {
																					value: color.class,
																					keywords: ["color", color.name, color.class],
																					onHighlight: () => handleColorHighlight(color),
																					onSelect: () => {
																						runCommand(() => clipboard.copy(color.oklch));
																					},

																					children: ($$renderer) => {
																						$$renderer.push(`<div class="border-ghost aspect-square size-4 rounded-sm bg-(--color) after:rounded-sm"${$.attr_style(`--color: ${$.stringify(color.oklch)};`)}></div> ${$.escape(color.class)} <span class="ms-auto font-mono text-xs font-normal text-muted-foreground tabular-nums">${$.escape(color.oklch)}</span>`);
																					},
																					$$slots: { default: true }
																				});
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

									$$renderer.push(` <div class="absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t border-t-neutral-100 bg-neutral-50 px-4 text-xs font-medium text-muted-foreground dark:border-t-neutral-700 dark:bg-neutral-800"><div class="flex items-center gap-2">`);

									if (Kbd.Root) {
										$$renderer.push('<!--[-->');

										Kbd.Root($$renderer, {
											class: 'border bg-background',
											children: ($$renderer) => {
												CornerDownLeftIcon($$renderer, {});
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (selectedType === "page" || selectedType === "component") {
										$$renderer.push(`<!--[0-->Go to Page`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (selectedType === "color") {
										$$renderer.push(`<!--[0-->Copy OKLCH`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div> `);

									if (copyPayload) {
										$$renderer.push('<!--[0-->');
										Separator($$renderer, { orientation: 'vertical', class: '!h-4' });
										$$renderer.push(`<!----> <div class="flex items-center gap-1">`);

										if (Kbd.Group) {
											$$renderer.push('<!--[-->');

											Kbd.Group($$renderer, {
												children: ($$renderer) => {
													if (Kbd.Root) {
														$$renderer.push('<!--[-->');

														Kbd.Root($$renderer, {
															class: 'border bg-background',
															children: ($$renderer) => {
																$$renderer.push(`<!---->⌘`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Kbd.Root) {
														$$renderer.push('<!--[-->');

														Kbd.Root($$renderer, {
															class: 'border bg-background',
															children: ($$renderer) => {
																$$renderer.push(`<!---->C`);
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

										$$renderer.push(` ${$.escape(copyPayload)}</div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div>`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}