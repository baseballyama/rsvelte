import * as $ from 'svelte/internal/server';
import { Avatar, DropdownMenu } from "bits-ui";
import Cardholder from "phosphor-svelte/lib/Cardholder";
import CaretRight from "phosphor-svelte/lib/CaretRight";
import DotsThree from "phosphor-svelte/lib/DotsThree";
import GearSix from "phosphor-svelte/lib/GearSix";
import UserCircle from "phosphor-svelte/lib/UserCircle";
import UserCirclePlus from "phosphor-svelte/lib/UserCirclePlus";
import Bell from "phosphor-svelte/lib/Bell";
import Check from "phosphor-svelte/lib/Check";
import DotOutline from "phosphor-svelte/lib/DotOutline";
import { fly } from "svelte/transition";

export default function Dropdown_menu_demo_transition($$renderer) {
	let notifications = false;
	let invited = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					if (DropdownMenu.Trigger) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Trigger($$renderer, {
							class: 'border-input shadow-btn hover:bg-muted inline-flex h-10 w-10 select-none items-center justify-center rounded-full border text-sm font-medium active:scale-[0.98]',
							children: ($$renderer) => {
								DotsThree($$renderer, { class: 'text-foreground h-6 w-6' });
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (DropdownMenu.Portal) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Portal($$renderer, {
							children: ($$renderer) => {
								{
									function child($$renderer, { wrapperProps, props, open }) {
										if (open) {
											$$renderer.push(`<!--[0--><div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...props })}>`);

											if (DropdownMenu.Item) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Item($$renderer, {
													class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
													children: ($$renderer) => {
														$$renderer.push(`<div class="flex items-center">`);
														UserCircle($$renderer, { class: 'text-foreground-alt mr-2 size-5' });
														$$renderer.push(`<!----> Profile</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-xs">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[10px]">P</kbd></div>`);
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
													class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
													children: ($$renderer) => {
														$$renderer.push(`<div class="flex items-center">`);
														Cardholder($$renderer, { class: 'text-foreground-alt mr-2 size-5' });
														$$renderer.push(`<!----> Billing</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-xs">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[10px]">B</kbd></div>`);
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
													class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
													children: ($$renderer) => {
														$$renderer.push(`<div class="flex items-center">`);
														GearSix($$renderer, { class: 'text-foreground-alt mr-2 size-5' });
														$$renderer.push(`<!----> Settings</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-xs">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[10px]">S</kbd></div>`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											{
												function children($$renderer, { checked }) {
													$$renderer.push(`<div class="flex items-center pr-4">`);
													Bell($$renderer, { class: 'text-foreground-alt mr-2 size-5' });
													$$renderer.push(`<!----> Notifications</div> <div class="ml-auto flex items-center gap-px">`);

													if (checked) {
														$$renderer.push('<!--[0-->');
														Check($$renderer, { class: 'size-4' });
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--></div>`);
												}

												if (DropdownMenu.CheckboxItem) {
													$$renderer.push('<!--[-->');

													DropdownMenu.CheckboxItem($$renderer, {
														class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
														get checked() {
															return notifications;
														},

														set checked($$value) {
															notifications = $$value;
															$$settled = false;
														},
														children,
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											$$renderer.push(` `);

											if (DropdownMenu.Sub) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Sub($$renderer, {
													children: ($$renderer) => {
														if (DropdownMenu.SubTrigger) {
															$$renderer.push('<!--[-->');

															DropdownMenu.SubTrigger($$renderer, {
																class: 'rounded-button data-highlighted:bg-muted data-[state=open]:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																children: ($$renderer) => {
																	$$renderer.push(`<div class="flex items-center">`);
																	UserCirclePlus($$renderer, { class: 'text-foreground-alt mr-2 size-5' });
																	$$renderer.push(`<!----> Workspace</div> <div class="ml-auto flex items-center gap-px">`);
																	CaretRight($$renderer, { class: 'text-foreground-alt size-5' });
																	$$renderer.push(`<!----></div>`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DropdownMenu.SubContent) {
															$$renderer.push('<!--[-->');

															DropdownMenu.SubContent($$renderer, {
																class: 'border-muted bg-background shadow-popover w-[209px] rounded-xl border px-1 py-1.5 focus-visible:outline-none',
																sideOffset: 10,
																children: ($$renderer) => {
																	if (DropdownMenu.RadioGroup) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.RadioGroup($$renderer, {
																			get value() {
																				return invited;
																			},

																			set value($$value) {
																				invited = $$value;
																				$$settled = false;
																			},

																			children: ($$renderer) => {
																				{
																					function children($$renderer, { checked }) {
																						if (Avatar.Root) {
																							$$renderer.push('<!--[-->');

																							Avatar.Root($$renderer, {
																								class: 'border-foreground/50 relative mr-3 flex size-5 shrink-0 overflow-hidden rounded-full border',
																								children: ($$renderer) => {
																									if (Avatar.Image) {
																										$$renderer.push('<!--[-->');

																										Avatar.Image($$renderer, {
																											src: 'https://github.com/huntabyte.png',
																											alt: '@huntabyte',
																											class: 'aspect-square h-full w-full'
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (Avatar.Fallback) {
																										$$renderer.push('<!--[-->');

																										Avatar.Fallback($$renderer, {
																											class: 'bg-muted text-xxs flex h-full w-full items-center justify-center rounded-full',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->HJ`);
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

																						$$renderer.push(` @huntabyte `);

																						if (checked) {
																							$$renderer.push('<!--[0-->');
																							DotOutline($$renderer, { class: 'ml-auto size-4' });
																						} else {
																							$$renderer.push('<!--[-1-->');
																						}

																						$$renderer.push(`<!--]-->`);
																					}

																					if (DropdownMenu.RadioItem) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.RadioItem($$renderer, {
																							value: 'huntabyte',
																							class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																							children,
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				}

																				$$renderer.push(` `);

																				{
																					function children($$renderer, { checked }) {
																						if (Avatar.Root) {
																							$$renderer.push('<!--[-->');

																							Avatar.Root($$renderer, {
																								class: 'border-foreground/50 relative mr-3 flex size-5 shrink-0 overflow-hidden rounded-full border',
																								children: ($$renderer) => {
																									if (Avatar.Image) {
																										$$renderer.push('<!--[-->');

																										Avatar.Image($$renderer, {
																											src: 'https://github.com/pavelstianko.png',
																											alt: '@pavel_stianko',
																											class: 'aspect-square h-full w-full'
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (Avatar.Fallback) {
																										$$renderer.push('<!--[-->');

																										Avatar.Fallback($$renderer, {
																											class: 'bg-muted flex h-full w-full items-center justify-center rounded-full text-xs',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->PS`);
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

																						$$renderer.push(` @pavel_stianko `);

																						if (checked) {
																							$$renderer.push('<!--[0-->');
																							DotOutline($$renderer, { class: 'ml-auto size-4' });
																						} else {
																							$$renderer.push('<!--[-1-->');
																						}

																						$$renderer.push(`<!--]-->`);
																					}

																					if (DropdownMenu.RadioItem) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.RadioItem($$renderer, {
																							value: 'pavel',
																							class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																							children,
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				}

																				$$renderer.push(` `);

																				{
																					function children($$renderer, { checked }) {
																						if (Avatar.Root) {
																							$$renderer.push('<!--[-->');

																							Avatar.Root($$renderer, {
																								class: 'border-foreground/50 relative mr-3 flex size-5 shrink-0 overflow-hidden rounded-full border',
																								children: ($$renderer) => {
																									if (Avatar.Image) {
																										$$renderer.push('<!--[-->');

																										Avatar.Image($$renderer, {
																											src: 'https://github.com/adriangonz97.png',
																											alt: '@cokakoala_',
																											class: 'aspect-square h-full w-full'
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (Avatar.Fallback) {
																										$$renderer.push('<!--[-->');

																										Avatar.Fallback($$renderer, {
																											class: 'bg-muted flex h-full w-full items-center justify-center rounded-full text-xs',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->CK`);
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

																						$$renderer.push(` @cokakoala_ `);

																						if (checked) {
																							$$renderer.push('<!--[0-->');
																							DotOutline($$renderer, { class: 'ml-auto size-4' });
																						} else {
																							$$renderer.push('<!--[-1-->');
																						}

																						$$renderer.push(`<!--]-->`);
																					}

																					if (DropdownMenu.RadioItem) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.RadioItem($$renderer, {
																							value: 'cokakoala',
																							class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																							children,
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				}

																				$$renderer.push(` `);

																				{
																					function children($$renderer, { checked }) {
																						if (Avatar.Root) {
																							$$renderer.push('<!--[-->');

																							Avatar.Root($$renderer, {
																								class: 'border-foreground/50 relative mr-3 flex size-5 shrink-0 overflow-hidden rounded-full border',
																								children: ($$renderer) => {
																									if (Avatar.Image) {
																										$$renderer.push('<!--[-->');

																										Avatar.Image($$renderer, {
																											src: 'https://github.com/tglide.png',
																											alt: '@tglide',
																											class: 'aspect-square h-full w-full'
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (Avatar.Fallback) {
																										$$renderer.push('<!--[-->');

																										Avatar.Fallback($$renderer, {
																											class: 'bg-muted flex h-full w-full items-center justify-center rounded-full text-xs',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->TL`);
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

																						$$renderer.push(` @thomasglopes `);

																						if (checked) {
																							$$renderer.push('<!--[0-->');
																							DotOutline($$renderer, { class: 'ml-auto size-4' });
																						} else {
																							$$renderer.push('<!--[-1-->');
																						}

																						$$renderer.push(`<!--]-->`);
																					}

																					if (DropdownMenu.RadioItem) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.RadioItem($$renderer, {
																							value: 'tglide',
																							class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																							children,
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
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

											$$renderer.push(`</div></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									}

									if (DropdownMenu.Content) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Content($$renderer, {
											class: 'border-muted bg-background shadow-popover w-[229px] rounded-xl border px-1 py-1.5 focus-visible:outline-none',
											sideOffset: 8,
											forceMount: true,
											child,
											$$slots: { child: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}