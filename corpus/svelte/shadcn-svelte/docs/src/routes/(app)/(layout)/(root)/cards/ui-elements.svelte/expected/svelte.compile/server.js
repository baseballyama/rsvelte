import * as $ from 'svelte/internal/server';
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

export default function Ui_elements($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Card($$renderer, {
			class: 'w-full',
			children: ($$renderer) => {
				CardContent($$renderer, {
					class: 'flex flex-col gap-6',
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex gap-2">`);

						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Button `);

								IconPlaceholder($$renderer, {
									lucide: 'ArrowRightIcon',
									tabler: 'IconArrowRight',
									hugeicons: 'ArrowRight02Icon',
									phosphor: 'ArrowRightIcon',
									remixicon: 'RiArrowRightLine',
									'data-icon': 'inline-end'
								});

								$$renderer.push(`<!---->`);
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

						$$renderer.push(`<!----></div> `);

						FieldGroup($$renderer, {
							children: ($$renderer) => {
								Field($$renderer, {
									children: ($$renderer) => {
										InputGroup($$renderer, {
											children: ($$renderer) => {
												InputGroupInput($$renderer, { placeholder: 'Name' });
												$$renderer.push(`<!----> `);

												InputGroupAddon($$renderer, {
													align: 'inline-end',
													children: ($$renderer) => {
														InputGroupText($$renderer, {
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
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Field($$renderer, {
									class: 'flex-1',
									children: ($$renderer) => {
										Textarea($$renderer, { placeholder: 'Message', class: 'resize-none' });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <div class="flex items-center gap-2"><div class="flex gap-2">`);

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
							class: 'hidden 4xl:flex',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Outline`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> `);

						RadioGroup($$renderer, {
							value: 'apple',
							class: 'ml-auto flex w-fit gap-3',
							'aria-label': 'Fruit preference',
							children: ($$renderer) => {
								RadioGroupItem($$renderer, { value: 'apple', 'aria-label': 'Apple' });
								$$renderer.push(`<!----> `);
								RadioGroupItem($$renderer, { value: 'banana', 'aria-label': 'Banana' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <div class="flex gap-3">`);
						Checkbox($$renderer, { checked: true, 'aria-label': 'Enable email alerts' });
						$$renderer.push(`<!----> `);
						Checkbox($$renderer, { class: 'hidden 4xl:flex', 'aria-label': 'Enable push alerts' });
						$$renderer.push(`<!----></div> `);

						Switch($$renderer, {
							checked: true,
							class: 'flex data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=unchecked]:border-transparent data-[state=unchecked]:bg-input/90 4xl:hidden [&_[data-slot=switch-thumb]]:bg-background [&_[data-slot=switch-thumb][data-state=checked]]:translate-x-[calc(100%-4px)] dark:[&_[data-slot=switch-thumb][data-state=checked]]:bg-primary-foreground [&_[data-slot=switch-thumb][data-state=unchecked]]:translate-x-0 dark:[&_[data-slot=switch-thumb][data-state=unchecked]]:bg-foreground',
							'aria-label': 'Enable compact notifications'
						});

						$$renderer.push(`<!----></div> <div class="flex items-center gap-4">`);

						AlertDialog($$renderer, {
							children: ($$renderer) => {
								AlertDialogTrigger($$renderer, {
									class: buttonVariants({ variant: "outline" }),
									children: ($$renderer) => {
										$$renderer.push(`<span class="hidden md:flex style-sera:md:hidden">Alert Dialog</span> <span class="flex md:hidden style-sera:md:flex">Dialog</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								AlertDialogContent($$renderer, {
									size: 'sm',
									portalProps: { disabled: true },
									children: ($$renderer) => {
										AlertDialogHeader($$renderer, {
											children: ($$renderer) => {
												AlertDialogTitle($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Allow accessory to connect?`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												AlertDialogDescription($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Do you want to allow the USB accessory to connect to this device and your data?`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										AlertDialogFooter($$renderer, {
											children: ($$renderer) => {
												AlertDialogCancel($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Don't allow`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												AlertDialogAction($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Allow`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ButtonGroup($$renderer, {
							class: 'ml-auto',
							children: ($$renderer) => {
								Button($$renderer, {
									variant: 'outline',
									children: ($$renderer) => {
										$$renderer.push(`<span class="style-sera:hidden">Button Group</span> <span class="hidden style-sera:block">Group</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								DropdownMenu($$renderer, {
									children: ($$renderer) => {
										DropdownMenuTrigger($$renderer, {
											class: buttonVariants({ variant: "outline", size: "icon" }),
											'aria-label': 'Open quick actions',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'ArrowUpIcon',
													tabler: 'IconArrowUp',
													hugeicons: 'ArrowUp01Icon',
													phosphor: 'ArrowUpIcon',
													remixicon: 'RiArrowUpLine'
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										DropdownMenuContent($$renderer, {
											align: 'end',
											side: 'top',
											class: 'w-40',
											portalProps: { disabled: true },
											children: ($$renderer) => {
												DropdownMenuGroup($$renderer, {
													children: ($$renderer) => {
														DropdownMenuLabel($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Quick Actions`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														DropdownMenuItem($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Mute Conversation`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														DropdownMenuItem($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Mark as Read`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														DropdownMenuItem($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Block User`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);
												DropdownMenuSeparator($$renderer, {});
												$$renderer.push(`<!----> `);

												DropdownMenuGroup($$renderer, {
													children: ($$renderer) => {
														DropdownMenuItem($$renderer, {
															variant: 'destructive',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Delete Conversation`);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Switch($$renderer, {
							checked: true,
							class: 'hidden data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=unchecked]:border-transparent data-[state=unchecked]:bg-input/90 4xl:flex [&_[data-slot=switch-thumb]]:bg-background [&_[data-slot=switch-thumb][data-state=checked]]:translate-x-[calc(100%-4px)] dark:[&_[data-slot=switch-thumb][data-state=checked]]:bg-primary-foreground [&_[data-slot=switch-thumb][data-state=unchecked]]:translate-x-0 dark:[&_[data-slot=switch-thumb][data-state=unchecked]]:bg-foreground',
							'aria-label': 'Enable advanced setting'
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}