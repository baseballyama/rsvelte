import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Dropdown_menu_with_icons($$renderer) {
	Example($$renderer, {
		title: 'With Icons',
		children: ($$renderer) => {
			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'outline', class: 'w-fit' },
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->Open`);
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
								children: ($$renderer) => {
									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'UserIcon',
													tabler: 'IconUser',
													hugeicons: 'UserIcon',
													phosphor: 'UserIcon',
													remixicon: 'RiUserLine'
												});

												$$renderer.push(`<!----> Profile`);
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
													lucide: 'SettingsIcon',
													tabler: 'IconSettings',
													hugeicons: 'SettingsIcon',
													phosphor: 'GearIcon',
													remixicon: 'RiSettingsLine'
												});

												$$renderer.push(`<!----> Settings`);
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
											variant: 'destructive',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'LogOutIcon',
													tabler: 'IconLogout',
													hugeicons: 'LogoutIcon',
													phosphor: 'SignOutIcon',
													remixicon: 'RiLogoutBoxLine'
												});

												$$renderer.push(`<!----> Log out`);
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