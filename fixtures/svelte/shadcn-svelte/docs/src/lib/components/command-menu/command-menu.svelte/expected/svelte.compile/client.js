import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<span class="hidden xl:inline-flex">Search documentation...</span> <span class="inline-flex xl:hidden">Search...</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> `, 1);
var root_3 = $.from_html(`<div class="aspect-square size-4 rounded-full border border-dashed border-muted-foreground"></div>`);
var root_4 = $.from_html(`<!> <span class="ms-auto font-mono text-xs font-normal text-muted-foreground tabular-nums"> </span>`, 1);
var root_5 = $.from_html(`<div class="border-ghost aspect-square size-4 rounded-sm bg-(--color) after:rounded-sm"></div> <span class="ms-auto font-mono text-xs font-normal text-muted-foreground tabular-nums"> </span>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <div class="flex items-center gap-1"><!> </div>`, 1);
var root_8 = $.from_html(`<!> <!> <div class="absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t border-t-neutral-100 bg-neutral-50 px-4 text-xs font-medium text-muted-foreground dark:border-t-neutral-700 dark:bg-neutral-800"><div class="flex items-center gap-2"><!> <!> <!></div> <!></div>`, 1);

export default function Command_menu($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let selectedType = $.state(null);
	let copyPayload = $.state("");
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

			$.set(selectedType, "component");

			const cmd = getCommand(userConfig.current.packageManager, "execute", `shadcn-svelte add ${componentName}`);

			$.set(copyPayload, `${cmd.command} ${cmd.args.join(" ")}`.trim(), true);
		} else {
			$.set(selectedType, "page");
			$.set(copyPayload, "");
		}
	}

	function handleBlockHighlight(block) {
		$.set(selectedType, "block");

		const cmd = getCommand(userConfig.current.packageManager, "execute", `shadcn-svelte add ${block.name}`);

		$.set(copyPayload, `${cmd.command} ${cmd.args.join(" ")}`.trim(), true);
	}

	function handleColorHighlight(color) {
		$.set(selectedType, "color");
		$.set(copyPayload, color.class, true);
	}

	function runCommand(command) {
		$.set(open, false);
		command();
	}

	function openCommandMenu() {
		// Close mobile menu first if callback is provided
		if ($$props.closeMobileMenu) {
			$$props.closeMobileMenu();

			// Wait for the mobile menu animation to start closing (100ms matches the transition duration)
			setTimeout(
				() => {
					$.set(open, true);
				},
				0
			);
		} else {
			$.set(open, true);
		}
	}

	function handleKeydown(e) {
		if (e.key === "k" && (e.metaKey || e.ctrlKey) || e.key === "/") {
			if (e.target instanceof HTMLElement && e.target.isContentEditable || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
				return;
			}

			e.preventDefault();

			if ($.get(open)) {
				$.set(open, false);
			} else {
				openCommandMenu();
			}
		}

		if ($.get(open) && e.key === "c" && (e.metaKey || e.ctrlKey)) {
			runCommand(() => {
				if ($.get(selectedType) === "color") {
					clipboard.copy($.get(copyPayload));
				}

				if ($.get(selectedType) === "block") {
					clipboard.copy($.get(copyPayload));
				}

				if ($.get(selectedType) === "page" || $.get(selectedType) === "component") {
					clipboard.copy($.get(copyPayload));
				}
			});
		}
	}

	var fragment = $.comment();

	$.event('keydown', $.document, handleKeydown);

	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						{
							let $0 = $.derived(() => cn("relative h-8 w-full justify-start rounded-lg border-none bg-muted pl-3 text-foreground shadow-none transition-colors hover:bg-muted/50 md:w-48 lg:w-40 xl:w-64 dark:bg-card"));

							Button($$anchor, $.spread_props(props, {
								variant: 'outline',
								get class() {
									return $.get($0);
								},
								onclick: () => openCommandMenu(),
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();

									$.next(2);
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							}));
						}
					};

					$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
						Dialog_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						showCloseButton: false,
						class: 'rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_8();
							var node_3 = $.first_child(fragment_4);

							$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									class: 'sr-only',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_4 = $.first_child(fragment_5);

										$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Search documentation...');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Search for a command to run...');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_3, 2);

							$.component(node_6, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									class: 'rounded-none bg-transparent',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_1();
										var node_7 = $.first_child(fragment_6);

										$.component(node_7, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, { placeholder: 'Search documentation...' });
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												tabindex: -1,
												class: 'no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_6();
													var node_9 = $.first_child(fragment_7);

													$.component(node_9, () => Command.Empty, ($$anchor, Command_Empty) => {
														Command_Empty($$anchor, {
															class: 'py-12 text-center text-sm text-muted-foreground',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('No results found.');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_10 = $.sibling(node_9, 2);

													$.component(node_10, () => Command.Group, ($$anchor, Command_Group) => {
														Command_Group($$anchor, {
															heading: 'Pages',
															class: '!p-0 [&_[data-command-group-heading]]:scroll-mt-16 [&_[data-command-group-heading]]:!p-3 [&_[data-command-group-heading]]:!pb-1',
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = $.comment();
																var node_11 = $.first_child(fragment_8);

																$.each(node_11, 17, () => mainNavItems, (item) => item.href, ($$anchor, item) => {
																	{
																		let $0 = $.derived(() => `Pages ${$.get(item).title}`);
																		let $1 = $.derived(() => ["page", $.get(item).title.toLowerCase()]);

																		CommandMenuItem($$anchor, {
																			get value() {
																				return $.get($0);
																			},

																			get keywords() {
																				return $.get($1);
																			},
																			onHighlight: () => handlePageHighlight(false, { href: $.get(item).href ?? "", title: $.get(item).title }),
																			onSelect: () => {
																				runCommand(() => {
																					if ($.get(item).href) {
																						goto($.get(item).href);
																					}
																				});
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_10 = root_2();
																				var node_12 = $.first_child(fragment_10);

																				ArrowRightIcon(node_12, {});

																				var text_3 = $.sibling(node_12);

																				$.template_effect(() => $.set_text(text_3, ` ${$.get(item).title ?? ''}`));
																				$.append($$anchor, fragment_10);
																			},
																			$$slots: { default: true }
																		});
																	}
																});

																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													var node_13 = $.sibling(node_10, 2);

													$.each(node_13, 17, () => $.get(orderedSidebarGroups), (group) => group.title, ($$anchor, group) => {
														var fragment_11 = $.comment();
														var node_14 = $.first_child(fragment_11);

														$.component(node_14, () => Command.Group, ($$anchor, Command_Group_1) => {
															Command_Group_1($$anchor, {
																get heading() {
																	return $.get(group).title;
																},
																class: '!p-0 [&_[data-command-group-heading]]:scroll-mt-16 [&_[data-command-group-heading]]:!p-3 [&_[data-command-group-heading]]:!pb-1',
																children: ($$anchor, $$slotProps) => {
																	var fragment_12 = $.comment();
																	var node_15 = $.first_child(fragment_12);

																	$.each(node_15, 17, () => $.get(group).items, $.index, ($$anchor, item) => {
																		const isComponent = $.derived(() => $.get(item).href?.includes("/components/") ?? false);

																		{
																			let $0 = $.derived(() => $.get(item).title?.toString() ? `${$.get(group).title} ${$.get(item).title}` : "");
																			let $1 = $.derived(() => $.get(isComponent) ? ["component"] : undefined);

																			CommandMenuItem($$anchor, {
																				get value() {
																					return $.get($0);
																				},

																				get keywords() {
																					return $.get($1);
																				},
																				onHighlight: () => handlePageHighlight($.get(isComponent), { href: $.get(item).href ?? "", title: $.get(item).title }),
																				onSelect: () => {
																					runCommand(() => {
																						if ($.get(item).href) {
																							goto($.get(item).href);
																						}
																					});
																				},

																				children: ($$anchor, $$slotProps) => {
																					var fragment_14 = root_2();
																					var node_16 = $.first_child(fragment_14);

																					{
																						var consequent = ($$anchor) => {
																							var div = root_3();

																							$.append($$anchor, div);
																						};

																						var alternate = ($$anchor) => {
																							ArrowRightIcon($$anchor, {});
																						};

																						$.if(node_16, ($$render) => {
																							if ($.get(isComponent)) $$render(consequent); else $$render(alternate, -1);
																						});
																					}

																					var text_4 = $.sibling(node_16);

																					$.template_effect(() => $.set_text(text_4, ` ${$.get(item).title ?? ''}`));
																					$.append($$anchor, fragment_14);
																				},
																				$$slots: { default: true }
																			});
																		}
																	});

																	$.append($$anchor, fragment_12);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_11);
													});

													var node_17 = $.sibling(node_13, 2);

													{
														var consequent_1 = ($$anchor) => {
															var fragment_16 = $.comment();
															var node_18 = $.first_child(fragment_16);

															$.component(node_18, () => Command.Group, ($$anchor, Command_Group_2) => {
																Command_Group_2($$anchor, {
																	heading: 'Blocks',
																	class: '!p-0 [&_[data-command-group-heading]]:!p-3',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_17 = $.comment();
																		var node_19 = $.first_child(fragment_17);

																		$.each(node_19, 17, () => $$props.blocks, (block) => block.name, ($$anchor, block) => {
																			{
																				let $0 = $.derived(() => [
																					"block",
																					$.get(block).name,
																					$.get(block).description,
																					...$.get(block).categories
																				]);

																				CommandMenuItem($$anchor, {
																					get value() {
																						return $.get(block).name;
																					},
																					onHighlight: () => handleBlockHighlight($.get(block)),
																					get keywords() {
																						return $.get($0);
																					},

																					onSelect: () => {
																						runCommand(() => {
																							goto(`/blocks/${$.get(block).categories[0]}#${$.get(block).name}`);
																						});
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_19 = root_4();
																						var node_20 = $.first_child(fragment_19);

																						SquareDashedIcon(node_20, {});

																						var text_5 = $.sibling(node_20);
																						var span = $.sibling(text_5);
																						var text_6 = $.only_child(span, true);

																						$.template_effect(() => {
																							$.set_text(text_5, ` ${$.get(block).description ?? ''} `);
																							$.set_text(text_6, $.get(block).name);
																						});

																						$.append($$anchor, fragment_19);
																					},
																					$$slots: { default: true }
																				});
																			}
																		});

																		$.append($$anchor, fragment_17);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_16);
														};

														$.if(node_17, ($$render) => {
															if ($$props.blocks?.length) $$render(consequent_1);
														});
													}

													var node_21 = $.sibling(node_17, 2);

													$.each(node_21, 17, () => $$props.colors, (colorPalette) => colorPalette.name, ($$anchor, colorPalette) => {
														var fragment_20 = $.comment();
														var node_22 = $.first_child(fragment_20);

														{
															let $0 = $.derived(() => $.get(colorPalette).name.charAt(0).toUpperCase() + $.get(colorPalette).name.slice(1));

															$.component(node_22, () => Command.Group, ($$anchor, Command_Group_3) => {
																Command_Group_3($$anchor, {
																	get heading() {
																		return $.get($0);
																	},
																	class: '!p-0 [&_[data-command-group-heading]]:!p-3',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_21 = $.comment();
																		var node_23 = $.first_child(fragment_21);

																		$.each(node_23, 17, () => $.get(colorPalette).colors, (color) => color.hex, ($$anchor, color) => {
																			{
																				let $0 = $.derived(() => ["color", $.get(color).name, $.get(color).class]);

																				CommandMenuItem($$anchor, {
																					get value() {
																						return $.get(color).class;
																					},

																					get keywords() {
																						return $.get($0);
																					},
																					onHighlight: () => handleColorHighlight($.get(color)),
																					onSelect: () => {
																						runCommand(() => clipboard.copy($.get(color).oklch));
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_23 = root_5();
																						var div_1 = $.first_child(fragment_23);
																						var text_7 = $.sibling(div_1);
																						var span_1 = $.sibling(text_7);
																						var text_8 = $.only_child(span_1, true);

																						$.template_effect(() => {
																							$.set_style(div_1, `--color: ${$.get(color).oklch ?? ''};`);
																							$.set_text(text_7, ` ${$.get(color).class ?? ''} `);
																							$.set_text(text_8, $.get(color).oklch);
																						});

																						$.append($$anchor, fragment_23);
																					},
																					$$slots: { default: true }
																				});
																			}
																		});

																		$.append($$anchor, fragment_21);
																	},
																	$$slots: { default: true }
																});
															});
														}

														$.append($$anchor, fragment_20);
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var div_2 = $.sibling(node_6, 2);
							var div_3 = $.child(div_2);
							var node_24 = $.child(div_3);

							$.component(node_24, () => Kbd.Root, ($$anchor, Kbd_Root) => {
								Kbd_Root($$anchor, {
									class: 'border bg-background',
									children: ($$anchor, $$slotProps) => {
										CornerDownLeftIcon($$anchor, {});
									},
									$$slots: { default: true }
								});
							});

							var node_25 = $.sibling(node_24, 2);

							{
								var consequent_2 = ($$anchor) => {
									var text_9 = $.text('Go to Page');

									$.append($$anchor, text_9);
								};

								$.if(node_25, ($$render) => {
									if ($.get(selectedType) === "page" || $.get(selectedType) === "component") $$render(consequent_2);
								});
							}

							var node_26 = $.sibling(node_25, 2);

							{
								var consequent_3 = ($$anchor) => {
									var text_10 = $.text('Copy OKLCH');

									$.append($$anchor, text_10);
								};

								$.if(node_26, ($$render) => {
									if ($.get(selectedType) === "color") $$render(consequent_3);
								});
							}

							$.reset(div_3);

							var node_27 = $.sibling(div_3, 2);

							{
								var consequent_4 = ($$anchor) => {
									var fragment_25 = root_7();
									var node_28 = $.first_child(fragment_25);

									Separator(node_28, { orientation: 'vertical', class: '!h-4' });

									var div_4 = $.sibling(node_28, 2);
									var node_29 = $.child(div_4);

									$.component(node_29, () => Kbd.Group, ($$anchor, Kbd_Group) => {
										Kbd_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_26 = root_1();
												var node_30 = $.first_child(fragment_26);

												$.component(node_30, () => Kbd.Root, ($$anchor, Kbd_Root_1) => {
													Kbd_Root_1($$anchor, {
														class: 'border bg-background',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('⌘');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});
												});

												var node_31 = $.sibling(node_30, 2);

												$.component(node_31, () => Kbd.Root, ($$anchor, Kbd_Root_2) => {
													Kbd_Root_2($$anchor, {
														class: 'border bg-background',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_12 = $.text('C');

															$.append($$anchor, text_12);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_26);
											},
											$$slots: { default: true }
										});
									});

									var text_13 = $.sibling(node_29);

									$.reset(div_4);
									$.template_effect(() => $.set_text(text_13, ` ${$.get(copyPayload) ?? ''}`));
									$.append($$anchor, fragment_25);
								};

								$.if(node_27, ($$render) => {
									if ($.get(copyPayload)) $$render(consequent_4);
								});
							}

							$.reset(div_2);
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}