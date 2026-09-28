import * as $ from 'svelte/internal/server';
import { tick } from "svelte";
import { toast } from "svelte-sonner";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Combobox_with_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];
		let open = false;
		let value = "";
		let triggerRef = null;
		const selectedValue = $.derived(() => value || null);

		function closeAndFocusTrigger() {
			open = false;

			tick().then(() => {
				triggerRef?.focus();
			});
		}

		function handleSubmit(e) {
			e.preventDefault();

			const formData = new FormData(e.target);
			const framework = formData.get("framework");

			toast(`You selected ${framework} as your framework.`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Form with Combobox',
				children: ($$renderer) => {
					if (Card.Root) {
						$$renderer.push('<!--[-->');

						Card.Root($$renderer, {
							class: 'w-full max-w-sm',
							size: 'sm',
							children: ($$renderer) => {
								if (Card.Content) {
									$$renderer.push('<!--[-->');

									Card.Content($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<form id="form-with-combobox" class="w-full">`);

											if (Field.Group) {
												$$renderer.push('<!--[-->');

												Field.Group($$renderer, {
													children: ($$renderer) => {
														if (Field.Field) {
															$$renderer.push('<!--[-->');

															Field.Field($$renderer, {
																children: ($$renderer) => {
																	if (Field.Label) {
																		$$renderer.push('<!--[-->');

																		Field.Label($$renderer, {
																			for: 'framework',
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

																	$$renderer.push(` <div class="relative"><input type="hidden" name="framework"${$.attr('value', value)}/> `);

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
																								class: 'w-full justify-between font-normal',
																								role: 'combobox',
																								'aria-expanded': open,
																								type: 'button',
																								'aria-describedby': undefined,
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

																	$$renderer.push(`</div>`);
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

											$$renderer.push(`</form>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Footer) {
									$$renderer.push('<!--[-->');

									Card.Footer($$renderer, {
										children: ($$renderer) => {
											Button($$renderer, {
												type: 'submit',
												form: 'form-with-combobox',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Submit`);
												},
												$$slots: { default: true }
											});
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