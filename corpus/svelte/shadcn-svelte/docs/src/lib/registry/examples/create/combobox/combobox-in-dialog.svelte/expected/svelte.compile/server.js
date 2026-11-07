import * as $ from 'svelte/internal/server';
import { tick } from "svelte";
import { toast } from "svelte-sonner";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Combobox_in_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];
		let dialogOpen = false;
		let comboboxOpen = false;
		let value = "";
		let triggerRef = null;
		const selectedValue = $.derived(() => value || null);

		function closeAndFocusTrigger() {
			comboboxOpen = false;

			tick().then(() => {
				triggerRef?.focus();
			});
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Combobox in Dialog',
				children: ($$renderer) => {
					if (Dialog.Root) {
						$$renderer.push('<!--[-->');

						Dialog.Root($$renderer, {
							get open() {
								return dialogOpen;
							},

							set open($$value) {
								dialogOpen = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										Button($$renderer, $.spread_props([
											{ variant: 'outline' },
											props,
											{
												children: ($$renderer) => {
													$$renderer.push(`<!---->Open Dialog`);
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
										class: 'sm:max-w-[425px]',
										children: ($$renderer) => {
											if (Dialog.Header) {
												$$renderer.push('<!--[-->');

												Dialog.Header($$renderer, {
													children: ($$renderer) => {
														if (Dialog.Title) {
															$$renderer.push('<!--[-->');

															Dialog.Title($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Select Framework`);
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
																	$$renderer.push(`<!---->Choose your preferred framework from the list below.`);
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

											if (Field.Field) {
												$$renderer.push('<!--[-->');

												Field.Field($$renderer, {
													children: ($$renderer) => {
														if (Field.Label) {
															$$renderer.push('<!--[-->');

															Field.Label($$renderer, {
																for: 'framework-dialog',
																class: 'sr-only',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Framework`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Popover.Root) {
															$$renderer.push('<!--[-->');

															Popover.Root($$renderer, {
																get open() {
																	return comboboxOpen;
																},

																set open($$value) {
																	comboboxOpen = $$value;
																	$$settled = false;
																},

																children: ($$renderer) => {
																	{
																		function child($$renderer, { props }) {
																			Button($$renderer, $.spread_props([
																				props,
																				{
																					variant: 'outline',
																					class: 'w-full justify-between font-normal',
																					role: 'combobox',
																					'aria-expanded': comboboxOpen,
																					type: 'button',
																					id: 'framework-dialog',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(selectedValue() ?? "Select a framework")} `);

																						IconPlaceholder($$renderer, {
																							lucide: 'ChevronDownIcon',
																							tabler: 'IconChevronDown',
																							hugeicons: 'ArrowDown01Icon',
																							phosphor: 'CaretDownIcon',
																							remixicon: 'RiArrowDownSLine',
																							class: 'size-4 text-muted-foreground opacity-50'
																						});

																						$$renderer.push(`<!---->`);
																					},
																					$$slots: { default: true }
																				}
																			]));
																		}

																		if (Popover.Trigger) {
																			$$renderer.push('<!--[-->');

																			Popover.Trigger($$renderer, {
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

																	if (Popover.Content) {
																		$$renderer.push('<!--[-->');

																		Popover.Content($$renderer, {
																			class: 'w-(--bits-popover-anchor-width) p-0',
																			align: 'start',
																			children: ($$renderer) => {
																				if (Command.Root) {
																					$$renderer.push('<!--[-->');

																					Command.Root($$renderer, {
																						children: ($$renderer) => {
																							if (Command.Input) {
																								$$renderer.push('<!--[-->');
																								Command.Input($$renderer, { placeholder: 'Search framework...' });
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
																													$$renderer.push(`<!---->No items found.`);
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
																												value: 'frameworks',
																												children: ($$renderer) => {
																													$$renderer.push(`<!--[-->`);

																													const each_array = $.ensure_array_like(frameworks);

																													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																														let framework = each_array[$$index];

																														if (Command.Item) {
																															$$renderer.push('<!--[-->');

																															Command.Item($$renderer, {
																																value: framework,
																																onSelect: () => {
																																	value = framework;
																																	closeAndFocusTrigger();
																																},

																																children: ($$renderer) => {
																																	IconPlaceholder($$renderer, {
																																		lucide: 'CheckIcon',
																																		tabler: 'IconCheck',
																																		hugeicons: 'Tick02Icon',
																																		phosphor: 'CheckIcon',
																																		remixicon: 'RiCheckLine',
																																		class: cn(value !== framework && "text-transparent")
																																	});

																																	$$renderer.push(`<!----> ${$.escape(framework)}`);
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
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Dialog.Footer) {
												$$renderer.push('<!--[-->');

												Dialog.Footer($$renderer, {
													children: ($$renderer) => {
														{
															function child($$renderer, { props }) {
																Button($$renderer, $.spread_props([
																	{ variant: 'outline' },
																	props,
																	{
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Cancel`);
																		},
																		$$slots: { default: true }
																	}
																]));
															}

															if (Dialog.Close) {
																$$renderer.push('<!--[-->');
																Dialog.Close($$renderer, { child, $$slots: { child: true } });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(` `);

														Button($$renderer, {
															type: 'button',
															onclick: () => {
																toast("Framework selected.");
																dialogOpen = false;
															},

															children: ($$renderer) => {
																$$renderer.push(`<!---->Confirm`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}