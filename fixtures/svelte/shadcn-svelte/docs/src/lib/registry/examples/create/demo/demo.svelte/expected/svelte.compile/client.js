import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex flex-col flex-wrap items-center gap-2"><div class="relative aspect-square w-full rounded-lg bg-(--color) after:absolute after:inset-0 after:rounded-lg after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten"></div> <div class="hidden max-w-14 truncate font-mono text-[0.60rem] md:block"> </div></div>`);

var root_1 = $.from_html(
	`<div class="flex flex-col gap-1"><div class="text-2xl font-medium">Style Overview</div> <div class="line-clamp-2 text-base text-muted-foreground">Designers love packing quirky glyphs into test phrases. This is a preview of the
							typography styles.</div></div> <div class="grid grid-cols-6 gap-3"></div>`,
	1
);

var root_2 = $.from_html(`<div class="grid grid-cols-8 place-items-center gap-4"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<span class="hidden md:block">Alert Dialog</span> <span class="block md:hidden">Dialog</span>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<div class="flex flex-col gap-4"><div class="flex flex-wrap gap-2"><!> <!> <!> <!></div> <!></div> <!> <!> <div class="flex items-center gap-2"><div class="flex gap-2"><!> <!> <!></div> <!> <div class="flex gap-3"><!> <!></div></div> <div class="flex items-center gap-4"><!> <!> <!></div>`, 1);
var root_8 = $.from_html(`<div class="flex min-h-screen w-full flex-col items-center justify-center bg-muted p-4 sm:p-6 lg:p-12 dark:bg-background"><div class="grid max-w-3xl gap-4 sm:grid-cols-2"><div class="flex flex-col gap-4"><!> <!></div> <div class="flex flex-col gap-4"><!></div></div></div>`);

export default function Demo($$anchor) {
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

	let sliderValue = $.state(500);
	let radioValue = $.state("apple");
	let switchChecked = $.state(true);
	let checkbox1Checked = $.state(true);
	let checkbox2Checked = $.state(false);
	var div = root_8();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-6',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var div_3 = $.sibling($.first_child(fragment_1), 2);

							$.each(div_3, 20, () => colorVariants, (variant) => variant, ($$anchor, variant) => {
								var div_4 = root();
								var div_5 = $.sibling($.child(div_4), 2);
								var text = $.only_child(div_5, true);

								$.reset(div_4);

								$.template_effect(() => {
									$.set_style(div_4, `--color: var(${variant ?? ''})`);
									$.set_text(text, variant);
								});

								$.append($$anchor, div_4);
							});

							$.reset(div_3);
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node, 2);

	$.component(node_2, () => Card.Root, ($$anchor, Card_Root_1) => {
		Card_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.component(node_3, () => Card.Content, ($$anchor, Card_Content_1) => {
					Card_Content_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div_6 = root_2();
							var node_4 = $.child(div_6);

							$.component(node_4, () => Card.Root, ($$anchor, Card_Root_2) => {
								Card_Root_2($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'CopyIcon',
											tabler: 'IconCopy',
											hugeicons: 'Copy01Icon',
											phosphor: 'CopyIcon',
											remixicon: 'RiFileCopyLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Card.Root, ($$anchor, Card_Root_3) => {
								Card_Root_3($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'CircleAlertIcon',
											tabler: 'IconExclamationCircle',
											hugeicons: 'AlertCircleIcon',
											phosphor: 'WarningCircleIcon',
											remixicon: 'RiErrorWarningLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Card.Root, ($$anchor, Card_Root_4) => {
								Card_Root_4($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'TrashIcon',
											tabler: 'IconTrash',
											hugeicons: 'Delete02Icon',
											phosphor: 'TrashIcon',
											remixicon: 'RiDeleteBinLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => Card.Root, ($$anchor, Card_Root_5) => {
								Card_Root_5($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'ShareIcon',
											tabler: 'IconShare',
											hugeicons: 'Share03Icon',
											phosphor: 'ShareIcon',
											remixicon: 'RiShareLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => Card.Root, ($$anchor, Card_Root_6) => {
								Card_Root_6($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'ShoppingBagIcon',
											tabler: 'IconShoppingBag',
											hugeicons: 'ShoppingBag01Icon',
											phosphor: 'BagIcon',
											remixicon: 'RiShoppingBagLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_9 = $.sibling(node_8, 2);

							$.component(node_9, () => Card.Root, ($$anchor, Card_Root_7) => {
								Card_Root_7($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'MoreHorizontalIcon',
											tabler: 'IconDots',
											hugeicons: 'MoreHorizontalCircle01Icon',
											phosphor: 'DotsThreeIcon',
											remixicon: 'RiMoreLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_9, 2);

							$.component(node_10, () => Card.Root, ($$anchor, Card_Root_8) => {
								Card_Root_8($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'Loader2Icon',
											tabler: 'IconLoader',
											hugeicons: 'Loading03Icon',
											phosphor: 'SpinnerIcon',
											remixicon: 'RiLoaderLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_10, 2);

							$.component(node_11, () => Card.Root, ($$anchor, Card_Root_9) => {
								Card_Root_9($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'PlusIcon',
											tabler: 'IconPlus',
											hugeicons: 'PlusSignIcon',
											phosphor: 'PlusIcon',
											remixicon: 'RiAddLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_11, 2);

							$.component(node_12, () => Card.Root, ($$anchor, Card_Root_10) => {
								Card_Root_10($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'MinusIcon',
											tabler: 'IconMinus',
											hugeicons: 'MinusSignIcon',
											phosphor: 'MinusIcon',
											remixicon: 'RiSubtractLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_13 = $.sibling(node_12, 2);

							$.component(node_13, () => Card.Root, ($$anchor, Card_Root_11) => {
								Card_Root_11($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'ArrowLeftIcon',
											tabler: 'IconArrowLeft',
											hugeicons: 'ArrowLeft02Icon',
											phosphor: 'ArrowLeftIcon',
											remixicon: 'RiArrowLeftLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_14 = $.sibling(node_13, 2);

							$.component(node_14, () => Card.Root, ($$anchor, Card_Root_12) => {
								Card_Root_12($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'ArrowRightIcon',
											tabler: 'IconArrowRight',
											hugeicons: 'ArrowRight02Icon',
											phosphor: 'ArrowRightIcon',
											remixicon: 'RiArrowRightLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_15 = $.sibling(node_14, 2);

							$.component(node_15, () => Card.Root, ($$anchor, Card_Root_13) => {
								Card_Root_13($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'CheckIcon',
											tabler: 'IconCheck',
											hugeicons: 'Tick02Icon',
											phosphor: 'CheckIcon',
											remixicon: 'RiCheckLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_16 = $.sibling(node_15, 2);

							$.component(node_16, () => Card.Root, ($$anchor, Card_Root_14) => {
								Card_Root_14($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'ChevronDownIcon',
											tabler: 'IconChevronDown',
											hugeicons: 'ArrowDown01Icon',
											phosphor: 'CaretDownIcon',
											remixicon: 'RiArrowDownSLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_17 = $.sibling(node_16, 2);

							$.component(node_17, () => Card.Root, ($$anchor, Card_Root_15) => {
								Card_Root_15($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'ChevronRightIcon',
											tabler: 'IconChevronRight',
											hugeicons: 'ArrowRight01Icon',
											phosphor: 'CaretRightIcon',
											remixicon: 'RiArrowRightSLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_18 = $.sibling(node_17, 2);

							$.component(node_18, () => Card.Root, ($$anchor, Card_Root_16) => {
								Card_Root_16($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'SearchIcon',
											tabler: 'IconSearch',
											hugeicons: 'Search01Icon',
											phosphor: 'MagnifyingGlassIcon',
											remixicon: 'RiSearchLine'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_19 = $.sibling(node_18, 2);

							$.component(node_19, () => Card.Root, ($$anchor, Card_Root_17) => {
								Card_Root_17($$anchor, {
									class: 'flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4',
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'SettingsIcon',
											tabler: 'IconSettings',
											hugeicons: 'Settings01Icon',
											phosphor: 'GearIcon',
											remixicon: 'RiSettingsLine'
										});
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_6);
							$.append($$anchor, div_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);

	var div_7 = $.sibling(div_2, 2);
	var node_20 = $.child(div_7);

	$.component(node_20, () => Card.Root, ($$anchor, Card_Root_18) => {
		Card_Root_18($$anchor, {
			class: 'w-full',
			children: ($$anchor, $$slotProps) => {
				var fragment_19 = $.comment();
				var node_21 = $.first_child(fragment_19);

				$.component(node_21, () => Card.Content, ($$anchor, Card_Content_2) => {
					Card_Content_2($$anchor, {
						class: 'flex flex-col gap-6',
						children: ($$anchor, $$slotProps) => {
							var fragment_20 = root_7();
							var div_8 = $.first_child(fragment_20);
							var div_9 = $.child(div_8);
							var node_22 = $.child(div_9);

							Button(node_22, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Button');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_23 = $.sibling(node_22, 2);

							Button(node_23, {
								variant: 'secondary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Secondary');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_24 = $.sibling(node_23, 2);

							Button(node_24, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Outline');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_25 = $.sibling(node_24, 2);

							Button(node_25, {
								variant: 'destructive',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Delete');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.reset(div_9);

							var node_26 = $.sibling(div_9, 2);

							$.component(node_26, () => Item.Root, ($$anchor, Item_Root) => {
								Item_Root($$anchor, {
									variant: 'outline',
									children: ($$anchor, $$slotProps) => {
										var fragment_21 = root_3();
										var node_27 = $.first_child(fragment_21);

										$.component(node_27, () => Item.Content, ($$anchor, Item_Content) => {
											Item_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_22 = root_3();
													var node_28 = $.first_child(fragment_22);

													$.component(node_28, () => Item.Title, ($$anchor, Item_Title) => {
														Item_Title($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Two-factor authentication');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													var node_29 = $.sibling(node_28, 2);

													$.component(node_29, () => Item.Description, ($$anchor, Item_Description) => {
														Item_Description($$anchor, {
															class: 'text-pretty xl:hidden 2xl:block',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text('Verify via email or phone number.');

																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_22);
												},
												$$slots: { default: true }
											});
										});

										var node_30 = $.sibling(node_27, 2);

										$.component(node_30, () => Item.Actions, ($$anchor, Item_Actions) => {
											Item_Actions($$anchor, {
												class: 'hidden md:flex',
												children: ($$anchor, $$slotProps) => {
													Button($$anchor, {
														size: 'sm',
														variant: 'secondary',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('Enable');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_21);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_8);

							var node_31 = $.sibling(div_8, 2);

							Slider(node_31, {
								type: 'single',
								max: 1000,
								min: 0,
								step: 10,
								class: 'flex-1',
								'aria-label': 'Slider',
								get value() {
									return $.get(sliderValue);
								},

								set value($$value) {
									$.set(sliderValue, $$value, true);
								}
							});

							var node_32 = $.sibling(node_31, 2);

							$.component(node_32, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_24 = root_3();
										var node_33 = $.first_child(fragment_24);

										$.component(node_33, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_25 = $.comment();
													var node_34 = $.first_child(fragment_25);

													$.component(node_34, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
														InputGroup_Root($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_26 = root_3();
																var node_35 = $.first_child(fragment_26);

																$.component(node_35, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																	InputGroup_Input($$anchor, { placeholder: 'Name' });
																});

																var node_36 = $.sibling(node_35, 2);

																$.component(node_36, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																	InputGroup_Addon($$anchor, {
																		align: 'inline-end',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_27 = $.comment();
																			var node_37 = $.first_child(fragment_27);

																			$.component(node_37, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
																				InputGroup_Text($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						IconPlaceholder($$anchor, {
																							lucide: 'SearchIcon',
																							tabler: 'IconSearch',
																							hugeicons: 'Search01Icon',
																							phosphor: 'MagnifyingGlassIcon',
																							remixicon: 'RiSearchLine'
																						});
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_27);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_26);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_25);
												},
												$$slots: { default: true }
											});
										});

										var node_38 = $.sibling(node_33, 2);

										$.component(node_38, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												class: 'flex-1',
												children: ($$anchor, $$slotProps) => {
													Textarea($$anchor, { placeholder: 'Message', class: 'resize-none' });
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_24);
									},
									$$slots: { default: true }
								});
							});

							var div_10 = $.sibling(node_32, 2);
							var div_11 = $.child(div_10);
							var node_39 = $.child(div_11);

							Badge(node_39, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Badge');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_40 = $.sibling(node_39, 2);

							Badge(node_40, {
								variant: 'secondary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Secondary');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_41 = $.sibling(node_40, 2);

							Badge(node_41, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Outline');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							$.reset(div_11);

							var node_42 = $.sibling(div_11, 2);

							$.component(node_42, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
								RadioGroup_Root($$anchor, {
									class: 'ml-auto flex w-fit gap-3',
									get value() {
										return $.get(radioValue);
									},

									set value($$value) {
										$.set(radioValue, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_30 = root_3();
										var node_43 = $.first_child(fragment_30);

										$.component(node_43, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
											RadioGroup_Item($$anchor, { value: 'apple' });
										});

										var node_44 = $.sibling(node_43, 2);

										$.component(node_44, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
											RadioGroup_Item_1($$anchor, { value: 'banana' });
										});

										$.append($$anchor, fragment_30);
									},
									$$slots: { default: true }
								});
							});

							var div_12 = $.sibling(node_42, 2);
							var node_45 = $.child(div_12);

							Checkbox(node_45, {
								get checked() {
									return $.get(checkbox1Checked);
								},

								set checked($$value) {
									$.set(checkbox1Checked, $$value, true);
								}
							});

							var node_46 = $.sibling(node_45, 2);

							Checkbox(node_46, {
								get checked() {
									return $.get(checkbox2Checked);
								},

								set checked($$value) {
									$.set(checkbox2Checked, $$value, true);
								}
							});

							$.reset(div_12);
							$.reset(div_10);

							var div_13 = $.sibling(div_10, 2);
							var node_47 = $.child(div_13);

							$.component(node_47, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
								AlertDialog_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_31 = root_3();
										var node_48 = $.first_child(fragment_31);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
													children: ($$anchor, $$slotProps) => {
														var fragment_33 = root_4();

														$.next(2);
														$.append($$anchor, fragment_33);
													},
													$$slots: { default: true }
												}));
											};

											$.component(node_48, () => AlertDialog.Trigger, ($$anchor, AlertDialog_Trigger) => {
												AlertDialog_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_49 = $.sibling(node_48, 2);

										$.component(node_49, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
											AlertDialog_Content($$anchor, {
												size: 'sm',
												children: ($$anchor, $$slotProps) => {
													var fragment_34 = root_3();
													var node_50 = $.first_child(fragment_34);

													$.component(node_50, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
														AlertDialog_Header($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_35 = root_3();
																var node_51 = $.first_child(fragment_35);

																$.component(node_51, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
																	AlertDialog_Title($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_11 = $.text('Allow accessory to connect?');

																			$.append($$anchor, text_11);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_52 = $.sibling(node_51, 2);

																$.component(node_52, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
																	AlertDialog_Description($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_12 = $.text('Do you want to allow the USB accessory to connect to this device and your data?');

																			$.append($$anchor, text_12);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_35);
															},
															$$slots: { default: true }
														});
													});

													var node_53 = $.sibling(node_50, 2);

													$.component(node_53, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
														AlertDialog_Footer($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_36 = root_3();
																var node_54 = $.first_child(fragment_36);

																$.component(node_54, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
																	AlertDialog_Cancel($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_13 = $.text('Don\'t allow');

																			$.append($$anchor, text_13);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_55 = $.sibling(node_54, 2);

																$.component(node_55, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
																	AlertDialog_Action($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_14 = $.text('Allow');

																			$.append($$anchor, text_14);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_36);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_34);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_31);
									},
									$$slots: { default: true }
								});
							});

							var node_56 = $.sibling(node_47, 2);

							$.component(node_56, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
								ButtonGroup_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_37 = root_3();
										var node_57 = $.first_child(fragment_37);

										Button(node_57, {
											variant: 'outline',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_15 = $.text('Button Group');

												$.append($$anchor, text_15);
											},
											$$slots: { default: true }
										});

										var node_58 = $.sibling(node_57, 2);

										$.component(node_58, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
											DropdownMenu_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_38 = root_3();
													var node_59 = $.first_child(fragment_38);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;

															Button($$anchor, $.spread_props({ variant: 'outline', size: 'icon' }, props, {
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'ChevronUpIcon',
																		tabler: 'IconChevronUp',
																		hugeicons: 'ArrowUp01Icon',
																		phosphor: 'CaretUpIcon',
																		remixicon: 'RiArrowUpSLine'
																	});
																},
																$$slots: { default: true }
															}));
														};

														$.component(node_59, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
															DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
														});
													}

													var node_60 = $.sibling(node_59, 2);

													$.component(node_60, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
														DropdownMenu_Content($$anchor, {
															align: 'end',
															side: 'top',
															class: 'w-40',
															children: ($$anchor, $$slotProps) => {
																var fragment_41 = root_6();
																var node_61 = $.first_child(fragment_41);

																$.component(node_61, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																	DropdownMenu_Group($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_42 = root_5();
																			var node_62 = $.first_child(fragment_42);

																			$.component(node_62, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
																				DropdownMenu_Label($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_16 = $.text('Quick Actions');

																						$.append($$anchor, text_16);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_63 = $.sibling(node_62, 2);

																			$.component(node_63, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																				DropdownMenu_Item($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_17 = $.text('Mute Conversation');

																						$.append($$anchor, text_17);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_64 = $.sibling(node_63, 2);

																			$.component(node_64, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																				DropdownMenu_Item_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_18 = $.text('Mark as Read');

																						$.append($$anchor, text_18);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_65 = $.sibling(node_64, 2);

																			$.component(node_65, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																				DropdownMenu_Item_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_19 = $.text('Block User');

																						$.append($$anchor, text_19);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_42);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_66 = $.sibling(node_61, 2);

																$.component(node_66, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																	DropdownMenu_Separator($$anchor, {});
																});

																var node_67 = $.sibling(node_66, 2);

																$.component(node_67, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
																	DropdownMenu_Group_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_43 = root_5();
																			var node_68 = $.first_child(fragment_43);

																			$.component(node_68, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_1) => {
																				DropdownMenu_Label_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_20 = $.text('Conversation');

																						$.append($$anchor, text_20);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_69 = $.sibling(node_68, 2);

																			$.component(node_69, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																				DropdownMenu_Item_3($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_21 = $.text('Share Conversation');

																						$.append($$anchor, text_21);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_70 = $.sibling(node_69, 2);

																			$.component(node_70, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																				DropdownMenu_Item_4($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_22 = $.text('Copy Conversation');

																						$.append($$anchor, text_22);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_71 = $.sibling(node_70, 2);

																			$.component(node_71, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																				DropdownMenu_Item_5($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_23 = $.text('Report Conversation');

																						$.append($$anchor, text_23);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_43);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_72 = $.sibling(node_67, 2);

																$.component(node_72, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
																	DropdownMenu_Separator_1($$anchor, {});
																});

																var node_73 = $.sibling(node_72, 2);

																$.component(node_73, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_2) => {
																	DropdownMenu_Group_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_44 = $.comment();
																			var node_74 = $.first_child(fragment_44);

																			$.component(node_74, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
																				DropdownMenu_Item_6($$anchor, {
																					variant: 'destructive',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_24 = $.text('Delete Conversation');

																						$.append($$anchor, text_24);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_44);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_41);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_38);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_37);
									},
									$$slots: { default: true }
								});
							});

							var node_75 = $.sibling(node_56, 2);

							Switch(node_75, {
								class: 'ml-auto',
								get checked() {
									return $.get(switchChecked);
								},

								set checked($$value) {
									$.set(switchChecked, $$value, true);
								}
							});

							$.reset(div_13);
							$.append($$anchor, fragment_20);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_19);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_7);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}