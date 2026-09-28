import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from "$lib/registry/ui/alert-dialog/index.js";

import { Badge } from "$lib/registry/ui/badge/index.js";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
import { Card, CardContent } from "$lib/registry/ui/card/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "$lib/registry/ui/dropdown-menu/index.js";

import { Field, FieldGroup } from "$lib/registry/ui/field/index.js";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "$lib/registry/ui/input-group/index.js";
import { RadioGroup, RadioGroupItem } from "$lib/registry/ui/radio-group/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`Button <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span class="hidden md:flex style-sera:md:hidden">Alert Dialog</span> <span class="flex md:hidden style-sera:md:flex">Dialog</span>`, 1);
var root_3 = $.from_html(`<span class="style-sera:hidden">Button Group</span> <span class="hidden style-sera:block">Group</span>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<div class="flex gap-2"><!> <!> <!></div> <!> <div class="flex items-center gap-2"><div class="flex gap-2"><!> <!> <!></div> <!> <div class="flex gap-3"><!> <!></div> <!></div> <div class="flex items-center gap-4"><!> <!> <!></div>`, 1);

export default function Ui_elements($$anchor, $$props) {
	$.push($$props, true);

	Card($$anchor, {
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			CardContent($$anchor, {
				class: 'flex flex-col gap-6',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_6();
					var div = $.first_child(fragment_2);
					var node = $.child(div);

					Button(node, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_3 = root();
							var node_1 = $.sibling($.first_child(fragment_3));

							IconPlaceholder(node_1, {
								lucide: 'ArrowRightIcon',
								tabler: 'IconArrowRight',
								hugeicons: 'ArrowRight02Icon',
								phosphor: 'ArrowRightIcon',
								remixicon: 'RiArrowRightLine',
								'data-icon': 'inline-end'
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node, 2);

					Button(node_2, {
						variant: 'secondary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Secondary');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Outline');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div);

					var node_4 = $.sibling(div, 2);

					FieldGroup(node_4, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_5 = $.first_child(fragment_4);

							Field(node_5, {
								children: ($$anchor, $$slotProps) => {
									InputGroup($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root_1();
											var node_6 = $.first_child(fragment_6);

											InputGroupInput(node_6, { placeholder: 'Name' });

											var node_7 = $.sibling(node_6, 2);

											InputGroupAddon(node_7, {
												align: 'inline-end',
												children: ($$anchor, $$slotProps) => {
													InputGroupText($$anchor, {
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
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_5, 2);

							Field(node_8, {
								class: 'flex-1',
								children: ($$anchor, $$slotProps) => {
									Textarea($$anchor, { placeholder: 'Message', class: 'resize-none' });
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var div_1 = $.sibling(node_4, 2);
					var div_2 = $.child(div_1);
					var node_9 = $.child(div_2);

					Badge(node_9, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Badge');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Badge(node_10, {
						variant: 'secondary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Secondary');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Badge(node_11, {
						variant: 'outline',
						class: 'hidden 4xl:flex',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Outline');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.reset(div_2);

					var node_12 = $.sibling(div_2, 2);

					RadioGroup(node_12, {
						value: 'apple',
						class: 'ml-auto flex w-fit gap-3',
						'aria-label': 'Fruit preference',
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_1();
							var node_13 = $.first_child(fragment_10);

							RadioGroupItem(node_13, { value: 'apple', 'aria-label': 'Apple' });

							var node_14 = $.sibling(node_13, 2);

							RadioGroupItem(node_14, { value: 'banana', 'aria-label': 'Banana' });
							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});

					var div_3 = $.sibling(node_12, 2);
					var node_15 = $.child(div_3);

					Checkbox(node_15, { checked: true, 'aria-label': 'Enable email alerts' });

					var node_16 = $.sibling(node_15, 2);

					Checkbox(node_16, { class: 'hidden 4xl:flex', 'aria-label': 'Enable push alerts' });
					$.reset(div_3);

					var node_17 = $.sibling(div_3, 2);

					Switch(node_17, {
						checked: true,
						class: 'flex data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=unchecked]:border-transparent data-[state=unchecked]:bg-input/90 4xl:hidden [&_[data-slot=switch-thumb]]:bg-background [&_[data-slot=switch-thumb][data-state=checked]]:translate-x-[calc(100%-4px)] dark:[&_[data-slot=switch-thumb][data-state=checked]]:bg-primary-foreground [&_[data-slot=switch-thumb][data-state=unchecked]]:translate-x-0 dark:[&_[data-slot=switch-thumb][data-state=unchecked]]:bg-foreground',
						'aria-label': 'Enable compact notifications'
					});

					$.reset(div_1);

					var div_4 = $.sibling(div_1, 2);
					var node_18 = $.child(div_4);

					AlertDialog(node_18, {
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root_1();
							var node_19 = $.first_child(fragment_11);

							{
								let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

								AlertDialogTrigger(node_19, {
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root_2();

										$.next(2);
										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							}

							var node_20 = $.sibling(node_19, 2);

							AlertDialogContent(node_20, {
								size: 'sm',
								portalProps: { disabled: true },
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root_1();
									var node_21 = $.first_child(fragment_13);

									AlertDialogHeader(node_21, {
										children: ($$anchor, $$slotProps) => {
											var fragment_14 = root_1();
											var node_22 = $.first_child(fragment_14);

											AlertDialogTitle(node_22, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Allow accessory to connect?');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});

											var node_23 = $.sibling(node_22, 2);

											AlertDialogDescription(node_23, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Do you want to allow the USB accessory to connect to this device and your data?');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_14);
										},
										$$slots: { default: true }
									});

									var node_24 = $.sibling(node_21, 2);

									AlertDialogFooter(node_24, {
										children: ($$anchor, $$slotProps) => {
											var fragment_15 = root_1();
											var node_25 = $.first_child(fragment_15);

											AlertDialogCancel(node_25, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Don\'t allow');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});

											var node_26 = $.sibling(node_25, 2);

											AlertDialogAction(node_26, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Allow');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_15);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});

					var node_27 = $.sibling(node_18, 2);

					ButtonGroup(node_27, {
						class: 'ml-auto',
						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root_1();
							var node_28 = $.first_child(fragment_16);

							Button(node_28, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root_3();

									$.next(2);
									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});

							var node_29 = $.sibling(node_28, 2);

							DropdownMenu(node_29, {
								children: ($$anchor, $$slotProps) => {
									var fragment_18 = root_1();
									var node_30 = $.first_child(fragment_18);

									{
										let $0 = $.derived(() => buttonVariants({ variant: "outline", size: "icon" }));

										DropdownMenuTrigger(node_30, {
											get class() {
												return $.get($0);
											},
											'aria-label': 'Open quick actions',
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'ArrowUpIcon',
													tabler: 'IconArrowUp',
													hugeicons: 'ArrowUp01Icon',
													phosphor: 'ArrowUpIcon',
													remixicon: 'RiArrowUpLine'
												});
											},
											$$slots: { default: true }
										});
									}

									var node_31 = $.sibling(node_30, 2);

									DropdownMenuContent(node_31, {
										align: 'end',
										side: 'top',
										class: 'w-40',
										portalProps: { disabled: true },
										children: ($$anchor, $$slotProps) => {
											var fragment_20 = root_5();
											var node_32 = $.first_child(fragment_20);

											DropdownMenuGroup(node_32, {
												children: ($$anchor, $$slotProps) => {
													var fragment_21 = root_4();
													var node_33 = $.first_child(fragment_21);

													DropdownMenuLabel(node_33, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('Quick Actions');

															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});

													var node_34 = $.sibling(node_33, 2);

													DropdownMenuItem(node_34, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('Mute Conversation');

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});

													var node_35 = $.sibling(node_34, 2);

													DropdownMenuItem(node_35, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('Mark as Read');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});

													var node_36 = $.sibling(node_35, 2);

													DropdownMenuItem(node_36, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_12 = $.text('Block User');

															$.append($$anchor, text_12);
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_21);
												},
												$$slots: { default: true }
											});

											var node_37 = $.sibling(node_32, 2);

											DropdownMenuSeparator(node_37, {});

											var node_38 = $.sibling(node_37, 2);

											DropdownMenuGroup(node_38, {
												children: ($$anchor, $$slotProps) => {
													DropdownMenuItem($$anchor, {
														variant: 'destructive',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_13 = $.text('Delete Conversation');

															$.append($$anchor, text_13);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_20);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_18);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_16);
						},
						$$slots: { default: true }
					});

					var node_39 = $.sibling(node_27, 2);

					Switch(node_39, {
						checked: true,
						class: 'hidden data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=unchecked]:border-transparent data-[state=unchecked]:bg-input/90 4xl:flex [&_[data-slot=switch-thumb]]:bg-background [&_[data-slot=switch-thumb][data-state=checked]]:translate-x-[calc(100%-4px)] dark:[&_[data-slot=switch-thumb][data-state=checked]]:bg-primary-foreground [&_[data-slot=switch-thumb][data-state=unchecked]]:translate-x-0 dark:[&_[data-slot=switch-thumb][data-state=unchecked]]:bg-foreground',
						'aria-label': 'Enable advanced setting'
					});

					$.reset(div_4);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}