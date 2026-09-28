import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import CirclePlusIcon from "@lucide/svelte/icons/circle-plus";
import { SvelteSet } from "svelte/reactivity";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { cn } from "$lib/utils.js";

export default function Data_table_faceted_filter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { column, title, options } = $$props;
		const facets = $.derived(() => column?.getFacetedUniqueValues());
		const selectedValues = $.derived(() => new SvelteSet(column?.getFilterValue()));

		if (Popover.Root) {
			$$renderer.push('<!--[-->');

			Popover.Root($$renderer, {
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								props,
								{
									variant: 'outline',
									size: 'sm',
									class: 'h-8 border-dashed',
									children: ($$renderer) => {
										CirclePlusIcon($$renderer, {});
										$$renderer.push(`<!----> ${$.escape(title)} `);

										if (selectedValues().size > 0) {
											$$renderer.push('<!--[0-->');
											Separator($$renderer, { orientation: 'vertical', class: 'mx-2 h-4' });
											$$renderer.push(`<!----> `);

											Badge($$renderer, {
												variant: 'secondary',
												class: 'rounded-sm px-1 font-normal lg:hidden',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(selectedValues().size)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <div class="hidden space-x-1 lg:flex">`);

											if (selectedValues().size > 2) {
												$$renderer.push('<!--[0-->');

												Badge($$renderer, {
													variant: 'secondary',
													class: 'rounded-sm px-1 font-normal',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(selectedValues().size)} selected`);
													},
													$$slots: { default: true }
												});
											} else {
												$$renderer.push(`<!--[-1--><!--[-->`);

												const each_array = $.ensure_array_like(options.filter((opt) => selectedValues().has(opt.value)));

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let option = each_array[$$index];

													Badge($$renderer, {
														variant: 'secondary',
														class: 'rounded-sm px-1 font-normal',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(option.label)}`);
														},
														$$slots: { default: true }
													});
												}

												$$renderer.push(`<!--]-->`);
											}

											$$renderer.push(`<!--]--></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								}
							]));
						}

						if (Popover.Trigger) {
							$$renderer.push('<!--[-->');
							Popover.Trigger($$renderer, { child, $$slots: { child: true } });
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
												Command.Input($$renderer, { placeholder: title });
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
																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);

																	const each_array_1 = $.ensure_array_like(options);

																	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																		let option = each_array_1[$$index_1];
																		const isSelected = selectedValues().has(option.value);

																		if (Command.Item) {
																			$$renderer.push('<!--[-->');

																			Command.Item($$renderer, {
																				onSelect: () => {
																					if (isSelected) {
																						selectedValues().delete(option.value);
																					} else {
																						selectedValues().add(option.value);
																					}

																					const filterValues = Array.from(selectedValues());

																					column?.setFilterValue(filterValues.length ? filterValues : undefined);
																				},

																				children: ($$renderer) => {
																					$$renderer.push(`<div${$.attr_class($.clsx(cn("me-2 flex size-4 items-center justify-center rounded-sm border border-primary", isSelected
																						? "bg-primary text-primary-foreground"
																						: "opacity-50 [&_svg]:invisible")))}>`);

																					CheckIcon($$renderer, { class: 'size-4' });
																					$$renderer.push(`<!----></div> `);

																					if (option.icon) {
																						$$renderer.push('<!--[0-->');

																						const Icon = option.icon;

																						if (Icon) {
																							$$renderer.push('<!--[-->');
																							Icon($$renderer, { class: 'text-muted-foreground' });
																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}
																					} else {
																						$$renderer.push('<!--[-1-->');
																					}

																					$$renderer.push(`<!--]--> <span>${$.escape(option.label)}</span> `);

																					if (facets()?.get(option.value)) {
																						$$renderer.push(`<!--[0--><span class="ms-auto flex size-4 items-center justify-center font-mono text-xs">${$.escape(facets().get(option.value))}</span>`);
																					} else {
																						$$renderer.push('<!--[-1-->');
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

														$$renderer.push(` `);

														if (selectedValues().size > 0) {
															$$renderer.push('<!--[0-->');

															if (Command.Separator) {
																$$renderer.push('<!--[-->');
																Command.Separator($$renderer, {});
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
																		if (Command.Item) {
																			$$renderer.push('<!--[-->');

																			Command.Item($$renderer, {
																				onSelect: () => column?.setFilterValue(undefined),
																				class: 'justify-center text-center',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Clear filters`);
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
														} else {
															$$renderer.push('<!--[-1-->');
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
	});
}