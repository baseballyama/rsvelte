import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Dropdown_menu_with_avatar($$renderer) {
	Example($$renderer, {
		title: 'With Avatar',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center justify-between gap-4">`);

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{
										variant: 'outline',
										class: 'h-12 justify-start px-2 md:max-w-[200px]'
									},
									props,
									{
										children: ($$renderer) => {
											if (Avatar.Root) {
												$$renderer.push('<!--[-->');

												Avatar.Root($$renderer, {
													children: ($$renderer) => {
														if (Avatar.Image) {
															$$renderer.push('<!--[-->');
															Avatar.Image($$renderer, { src: 'https://github.com/shadcn.png', alt: 'Shadcn' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Avatar.Fallback) {
															$$renderer.push('<!--[-->');

															Avatar.Fallback($$renderer, {
																class: 'rounded-lg',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->CN`);
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

											$$renderer.push(` <div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-semibold">shadcn</span> <span class="truncate text-xs text-muted-foreground">shadcn@example.com</span></div> `);

											IconPlaceholder($$renderer, {
												lucide: 'ChevronsUpDownIcon',
												tabler: 'IconSelector',
												hugeicons: 'UnfoldMoreIcon',
												phosphor: 'CaretUpDownIcon',
												remixicon: 'RiArrowUpDownLine',
												class: 'ml-auto text-muted-foreground'
											});

											$$renderer.push(`<!---->`);
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
								class: 'w-(--anchor-width) min-w-56',
								children: ($$renderer) => {
									if (DropdownMenu.Group) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'BadgeCheckIcon',
																tabler: 'IconRosetteDiscountCheck',
																hugeicons: 'CheckmarkBadgeIcon',
																phosphor: 'CheckCircleIcon',
																remixicon: 'RiCheckboxCircleLine'
															});

															$$renderer.push(`<!----> Account`);
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
															IconPlaceholder($$renderer, {
																lucide: 'CreditCardIcon',
																tabler: 'IconCreditCard',
																hugeicons: 'CreditCardIcon',
																phosphor: 'CreditCardIcon',
																remixicon: 'RiBankCardLine'
															});

															$$renderer.push(`<!----> Billing`);
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
															IconPlaceholder($$renderer, {
																lucide: 'BellIcon',
																tabler: 'IconBell',
																hugeicons: 'NotificationIcon',
																phosphor: 'BellIcon',
																remixicon: 'RiNotificationLine'
															});

															$$renderer.push(`<!----> Notifications`);
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

									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'LogOutIcon',
													tabler: 'IconLogout',
													hugeicons: 'LogoutIcon',
													phosphor: 'SignOutIcon',
													remixicon: 'RiLogoutBoxLine'
												});

												$$renderer.push(`<!----> Sign Out`);
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

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'ghost', size: 'icon', class: 'rounded-full' },
									props,
									{
										children: ($$renderer) => {
											if (Avatar.Root) {
												$$renderer.push('<!--[-->');

												Avatar.Root($$renderer, {
													children: ($$renderer) => {
														if (Avatar.Image) {
															$$renderer.push('<!--[-->');
															Avatar.Image($$renderer, { src: 'https://github.com/shadcn.png', alt: 'shadcn' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Avatar.Fallback) {
															$$renderer.push('<!--[-->');

															Avatar.Fallback($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->LR`);
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
								children: ($$renderer) => {
									if (DropdownMenu.Group) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'BadgeCheckIcon',
																tabler: 'IconRosetteDiscountCheck',
																hugeicons: 'CheckmarkBadgeIcon',
																phosphor: 'CheckCircleIcon',
																remixicon: 'RiCheckboxCircleLine'
															});

															$$renderer.push(`<!----> Account`);
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
															IconPlaceholder($$renderer, {
																lucide: 'CreditCardIcon',
																tabler: 'IconCreditCard',
																hugeicons: 'CreditCardIcon',
																phosphor: 'CreditCardIcon',
																remixicon: 'RiBankCardLine'
															});

															$$renderer.push(`<!----> Billing`);
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
															IconPlaceholder($$renderer, {
																lucide: 'BellIcon',
																tabler: 'IconBell',
																hugeicons: 'NotificationIcon',
																phosphor: 'BellIcon',
																remixicon: 'RiNotificationLine'
															});

															$$renderer.push(`<!----> Notifications`);
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

									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'LogOutIcon',
													tabler: 'IconLogout',
													hugeicons: 'LogoutIcon',
													phosphor: 'SignOutIcon',
													remixicon: 'RiLogoutBoxLine'
												});

												$$renderer.push(`<!----> Sign Out`);
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
}