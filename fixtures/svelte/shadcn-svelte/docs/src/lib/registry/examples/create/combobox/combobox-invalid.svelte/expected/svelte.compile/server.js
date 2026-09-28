import * as $ from 'svelte/internal/server';
import { tick } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Combobox_invalid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];
		let open = false;
		let value = "";
		let openInvalid = false;
		let valueInvalid = "";
		let triggerRef = null;
		let triggerRefInvalid = null;
		const selectedValue = $.derived(() => value || null);
		const selectedValueInvalid = $.derived(() => valueInvalid || null);

		function closeAndFocusTrigger() {
			open = false;

			tick().then(() => {
				triggerRef?.focus();
			});
		}

		function closeAndFocusTriggerInvalid() {
			openInvalid = false;

			tick().then(() => {
				triggerRefInvalid?.focus();
			});
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Invalid',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col gap-4">`);

					if (Popover.Root) {
						$$renderer.push('<!--[-->');

						Popover.Root($$renderer, {
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
												class: 'w-[200px] justify-between font-normal',
												role: 'combobox',
												'aria-expanded': open,
												'aria-invalid': 'true',
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
										class: 'w-[200px] p-0',
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

					$$renderer.push(` `);

					if (Field.Field) {
						$$renderer.push('<!--[-->');

						Field.Field($$renderer, {
							'data-invalid': true,
							children: ($$renderer) => {
								if (Field.Label) {
									$$renderer.push('<!--[-->');

									Field.Label($$renderer, {
										for: 'combobox-framework-invalid',
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
											return openInvalid;
										},

										set open($$value) {
											openInvalid = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											{
												function child($$renderer, { props }) {
													Button($$renderer, $.spread_props([
														props,
														{
															variant: 'outline',
															class: 'w-[200px] justify-between font-normal',
															role: 'combobox',
															'aria-expanded': openInvalid,
															'aria-invalid': true,
															id: 'combobox-framework-invalid',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(selectedValueInvalid() ?? "Select a framework")} `);

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
															return triggerRefInvalid;
														},

														set ref($$value) {
															triggerRefInvalid = $$value;
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
													class: 'w-[200px] p-0',
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

																							const each_array_1 = $.ensure_array_like(frameworks);

																							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																								let framework = each_array_1[$$index_1];

																								if (Command.Item) {
																									$$renderer.push('<!--[-->');

																									Command.Item($$renderer, {
																										value: framework,
																										onSelect: () => {
																											valueInvalid = framework;
																											closeAndFocusTriggerInvalid();
																										},

																										children: ($$renderer) => {
																											IconPlaceholder($$renderer, {
																												lucide: 'CheckIcon',
																												tabler: 'IconCheck',
																												hugeicons: 'Tick02Icon',
																												phosphor: 'CheckIcon',
																												remixicon: 'RiCheckLine',
																												class: cn(valueInvalid !== framework && "text-transparent")
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

								$$renderer.push(` `);

								if (Field.Description) {
									$$renderer.push('<!--[-->');

									Field.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Please select a valid framework.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Field.Error) {
									$$renderer.push('<!--[-->');
									Field.Error($$renderer, { errors: [{ message: "This field is required." }] });
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