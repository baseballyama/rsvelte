import * as $ from 'svelte/internal/server';
import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Demo($$renderer) {
	const colorVariants = [
		"--background",
		"--foreground",
		"--primary",
		"--secondary",
		"--muted",
		"--accent",
		"--destructive",
		"--chart-1",
		"--chart-2",
		"--chart-3",
		"--chart-4",
		"--chart-5"
	];

	let sliderValue = 500;
	let radioValue = "apple";
	let switchChecked = true;
	let checkbox1Checked = true;
	let checkbox2Checked = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex min-h-screen w-full flex-col items-center justify-center bg-muted p-4 sm:p-6 lg:p-12 dark:bg-background"><div class="grid max-w-3xl gap-4 sm:grid-cols-2"><div class="flex flex-col gap-4">`);

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				children: ($$renderer) => {
					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							class: 'flex flex-col gap-6',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex flex-col gap-1"><div class="text-2xl font-medium">Style Overview</div> <div class="line-clamp-2 text-base text-muted-foreground">Designers love packing quirky glyphs into test phrases. This is a preview of the
							typography styles.</div></div> <div class="grid grid-cols-6 gap-3"><!--[-->`);

								const each_array = $.ensure_array_like(colorVariants);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let variant = each_array[$$index];

									$$renderer.push(`<div class="flex flex-col flex-wrap items-center gap-2"${$.attr_style(`--color: var(${$.stringify(variant)})`)}><div class="relative aspect-square w-full rounded-lg bg-(--color) after:absolute after:inset-0 after:rounded-lg after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten"></div> <div class="hidden max-w-14 truncate font-mono text-[0.60rem] md:block">${$.escape(variant)}</div></div>`);
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

		$$renderer.push(` `);

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				children: ($$renderer) => {
					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<div class="grid grid-cols-8 place-items-center gap-4">`);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'CopyIcon',
												tabler: 'IconCopy',
												hugeicons: 'Copy01Icon',
												phosphor: 'CopyIcon',
												remixicon: 'RiFileCopyLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'CircleAlertIcon',
												tabler: 'IconExclamationCircle',
												hugeicons: 'AlertCircleIcon',
												phosphor: 'WarningCircleIcon',
												remixicon: 'RiErrorWarningLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'TrashIcon',
												tabler: 'IconTrash',
												hugeicons: 'Delete02Icon',
												phosphor: 'TrashIcon',
												remixicon: 'RiDeleteBinLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'ShareIcon',
												tabler: 'IconShare',
												hugeicons: 'Share03Icon',
												phosphor: 'ShareIcon',
												remixicon: 'RiShareLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'ShoppingBagIcon',
												tabler: 'IconShoppingBag',
												hugeicons: 'ShoppingBag01Icon',
												phosphor: 'BagIcon',
												remixicon: 'RiShoppingBagLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'MoreHorizontalIcon',
												tabler: 'IconDots',
												hugeicons: 'MoreHorizontalCircle01Icon',
												phosphor: 'DotsThreeIcon',
												remixicon: 'RiMoreLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'Loader2Icon',
												tabler: 'IconLoader',
												hugeicons: 'Loading03Icon',
												phosphor: 'SpinnerIcon',
												remixicon: 'RiLoaderLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'PlusIcon',
												tabler: 'IconPlus',
												hugeicons: 'PlusSignIcon',
												phosphor: 'PlusIcon',
												remixicon: 'RiAddLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'MinusIcon',
												tabler: 'IconMinus',
												hugeicons: 'MinusSignIcon',
												phosphor: 'MinusIcon',
												remixicon: 'RiSubtractLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'ArrowLeftIcon',
												tabler: 'IconArrowLeft',
												hugeicons: 'ArrowLeft02Icon',
												phosphor: 'ArrowLeftIcon',
												remixicon: 'RiArrowLeftLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'ArrowRightIcon',
												tabler: 'IconArrowRight',
												hugeicons: 'ArrowRight02Icon',
												phosphor: 'ArrowRightIcon',
												remixicon: 'RiArrowRightLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'CheckIcon',
												tabler: 'IconCheck',
												hugeicons: 'Tick02Icon',
												phosphor: 'CheckIcon',
												remixicon: 'RiCheckLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'ChevronDownIcon',
												tabler: 'IconChevronDown',
												hugeicons: 'ArrowDown01Icon',
												phosphor: 'CaretDownIcon',
												remixicon: 'RiArrowDownSLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'ChevronRightIcon',
												tabler: 'IconChevronRight',
												hugeicons: 'ArrowRight01Icon',
												phosphor: 'CaretRightIcon',
												remixicon: 'RiArrowRightSLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'SearchIcon',
												tabler: 'IconSearch',
												hugeicons: 'Search01Icon',
												phosphor: 'MagnifyingGlassIcon',
												remixicon: 'RiSearchLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Root) {
									$$renderer.push('<!--[-->');

									Card.Root($$renderer, {
										class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'SettingsIcon',
												tabler: 'IconSettings',
												hugeicons: 'Settings01Icon',
												phosphor: 'GearIcon',
												remixicon: 'RiSettingsLine'
											});
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

		$$renderer.push(`</div> <div class="flex flex-col gap-4">`);

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				class: 'w-full',
				children: ($$renderer) => {
					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							class: 'flex flex-col gap-6',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex flex-col gap-4"><div class="flex flex-wrap gap-2">`);

								Button($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Button`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									variant: 'secondary',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Secondary`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									variant: 'outline',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Outline`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									variant: 'destructive',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Delete`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div> `);

								if (Item.Root) {
									$$renderer.push('<!--[-->');

									Item.Root($$renderer, {
										variant: 'outline',
										children: ($$renderer) => {
											if (Item.Content) {
												$$renderer.push('<!--[-->');

												Item.Content($$renderer, {
													children: ($$renderer) => {
														if (Item.Title) {
															$$renderer.push('<!--[-->');

															Item.Title($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Two-factor authentication`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Item.Description) {
															$$renderer.push('<!--[-->');

															Item.Description($$renderer, {
																class: 'text-pretty xl:hidden 2xl:block',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Verify via email or phone number.`);
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

											if (Item.Actions) {
												$$renderer.push('<!--[-->');

												Item.Actions($$renderer, {
													class: 'hidden md:flex',
													children: ($$renderer) => {
														Button($$renderer, {
															size: 'sm',
															variant: 'secondary',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Enable`);
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

								$$renderer.push(`</div> `);

								Slider($$renderer, {
									type: 'single',
									max: 1000,
									min: 0,
									step: 10,
									class: 'flex-1',
									'aria-label': 'Slider',
									get value() {
										return sliderValue;
									},

									set value($$value) {
										sliderValue = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> `);

								if (Field.Group) {
									$$renderer.push('<!--[-->');

									Field.Group($$renderer, {
										children: ($$renderer) => {
											if (Field.Field) {
												$$renderer.push('<!--[-->');

												Field.Field($$renderer, {
													children: ($$renderer) => {
														if (InputGroup.Root) {
															$$renderer.push('<!--[-->');

															InputGroup.Root($$renderer, {
																children: ($$renderer) => {
																	if (InputGroup.Input) {
																		$$renderer.push('<!--[-->');
																		InputGroup.Input($$renderer, { placeholder: 'Name' });
																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (InputGroup.Addon) {
																		$$renderer.push('<!--[-->');

																		InputGroup.Addon($$renderer, {
																			align: 'inline-end',
																			children: ($$renderer) => {
																				if (InputGroup.Text) {
																					$$renderer.push('<!--[-->');

																					InputGroup.Text($$renderer, {
																						children: ($$renderer) => {
																							IconPlaceholder($$renderer, {
																								lucide: 'SearchIcon',
																								tabler: 'IconSearch',
																								hugeicons: 'Search01Icon',
																								phosphor: 'MagnifyingGlassIcon',
																								remixicon: 'RiSearchLine'
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
													class: 'flex-1',
													children: ($$renderer) => {
														Textarea($$renderer, { placeholder: 'Message', class: 'resize-none' });
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

								$$renderer.push(` <div class="flex items-center gap-2"><div class="flex gap-2">`);

								Badge($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Badge`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Badge($$renderer, {
									variant: 'secondary',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Secondary`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Badge($$renderer, {
									variant: 'outline',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Outline`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div> `);

								if (RadioGroup.Root) {
									$$renderer.push('<!--[-->');

									RadioGroup.Root($$renderer, {
										class: 'ml-auto flex w-fit gap-3',
										get value() {
											return radioValue;
										},

										set value($$value) {
											radioValue = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											if (RadioGroup.Item) {
												$$renderer.push('<!--[-->');
												RadioGroup.Item($$renderer, { value: 'apple' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (RadioGroup.Item) {
												$$renderer.push('<!--[-->');
												RadioGroup.Item($$renderer, { value: 'banana' });
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

								$$renderer.push(` <div class="flex gap-3">`);

								Checkbox($$renderer, {
									get checked() {
										return checkbox1Checked;
									},

									set checked($$value) {
										checkbox1Checked = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> `);

								Checkbox($$renderer, {
									get checked() {
										return checkbox2Checked;
									},

									set checked($$value) {
										checkbox2Checked = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----></div></div> <div class="flex items-center gap-4">`);

								if (AlertDialog.Root) {
									$$renderer.push('<!--[-->');

									AlertDialog.Root($$renderer, {
										children: ($$renderer) => {
											{
												function child($$renderer, { props }) {
													Button($$renderer, $.spread_props([
														{ variant: 'outline' },
														props,
														{
															children: ($$renderer) => {
																$$renderer.push(`<span class="hidden md:block">Alert Dialog</span> <span class="block md:hidden">Dialog</span>`);
															},
															$$slots: { default: true }
														}
													]));
												}

												if (AlertDialog.Trigger) {
													$$renderer.push('<!--[-->');
													AlertDialog.Trigger($$renderer, { child, $$slots: { child: true } });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											$$renderer.push(` `);

											if (AlertDialog.Content) {
												$$renderer.push('<!--[-->');

												AlertDialog.Content($$renderer, {
													size: 'sm',
													children: ($$renderer) => {
														if (AlertDialog.Header) {
															$$renderer.push('<!--[-->');

															AlertDialog.Header($$renderer, {
																children: ($$renderer) => {
																	if (AlertDialog.Title) {
																		$$renderer.push('<!--[-->');

																		AlertDialog.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Allow accessory to connect?`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (AlertDialog.Description) {
																		$$renderer.push('<!--[-->');

																		AlertDialog.Description($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Do you want to allow the USB accessory to connect to this device and your data?`);
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

														if (AlertDialog.Footer) {
															$$renderer.push('<!--[-->');

															AlertDialog.Footer($$renderer, {
																children: ($$renderer) => {
																	if (AlertDialog.Cancel) {
																		$$renderer.push('<!--[-->');

																		AlertDialog.Cancel($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Don't allow`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (AlertDialog.Action) {
																		$$renderer.push('<!--[-->');

																		AlertDialog.Action($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Allow`);
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

								if (ButtonGroup.Root) {
									$$renderer.push('<!--[-->');

									ButtonGroup.Root($$renderer, {
										children: ($$renderer) => {
											Button($$renderer, {
												variant: 'outline',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Button Group`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											if (DropdownMenu.Root) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Root($$renderer, {
													children: ($$renderer) => {
														{
															function child($$renderer, { props }) {
																Button($$renderer, $.spread_props([
																	{ variant: 'outline', size: 'icon' },
																	props,
																	{
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'ChevronUpIcon',
																				tabler: 'IconChevronUp',
																				hugeicons: 'ArrowUp01Icon',
																				phosphor: 'CaretUpIcon',
																				remixicon: 'RiArrowUpSLine'
																			});
																		},
																		$$slots: { default: true }
																	}
																]));
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
																align: 'end',
																side: 'top',
																class: 'w-40',
																children: ($$renderer) => {
																	if (DropdownMenu.Group) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Group($$renderer, {
																			children: ($$renderer) => {
																				if (DropdownMenu.Label) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Label($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Quick Actions`);
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
																							$$renderer.push(`<!---->Mute Conversation`);
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
																							$$renderer.push(`<!---->Mark as Read`);
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
																							$$renderer.push(`<!---->Block User`);
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

																	if (DropdownMenu.Group) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Group($$renderer, {
																			children: ($$renderer) => {
																				if (DropdownMenu.Label) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Label($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Conversation`);
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
																							$$renderer.push(`<!---->Share Conversation`);
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
																							$$renderer.push(`<!---->Copy Conversation`);
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
																							$$renderer.push(`<!---->Report Conversation`);
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

																	if (DropdownMenu.Group) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Group($$renderer, {
																			children: ($$renderer) => {
																				if (DropdownMenu.Item) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Item($$renderer, {
																						variant: 'destructive',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Delete Conversation`);
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

								Switch($$renderer, {
									class: 'ml-auto',
									get checked() {
										return switchChecked;
									},

									set checked($$value) {
										switchChecked = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----></div>`);
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

		$$renderer.push(`</div></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}