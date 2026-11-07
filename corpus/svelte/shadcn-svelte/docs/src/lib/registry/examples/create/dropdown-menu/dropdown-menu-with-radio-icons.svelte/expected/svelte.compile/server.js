import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Dropdown_menu_with_radio_icons($$renderer) {
	let paymentMethod = "card";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Radio with Icons',
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
												$$renderer.push(`<!---->Payment Method`);
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
									class: 'min-w-56',
									children: ($$renderer) => {
										if (DropdownMenu.Group) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.Label) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Select Payment Method`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.RadioGroup) {
														$$renderer.push('<!--[-->');

														DropdownMenu.RadioGroup($$renderer, {
															get value() {
																return paymentMethod;
															},

															set value($$value) {
																paymentMethod = $$value;
																$$settled = false;
															},

															children: ($$renderer) => {
																if (DropdownMenu.RadioItem) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.RadioItem($$renderer, {
																		value: 'card',
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'CreditCardIcon',
																				tabler: 'IconCreditCard',
																				hugeicons: 'CreditCardIcon',
																				phosphor: 'CreditCardIcon',
																				remixicon: 'RiBankCardLine'
																			});

																			$$renderer.push(`<!----> Credit Card`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.RadioItem) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.RadioItem($$renderer, {
																		value: 'paypal',
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'WalletIcon',
																				tabler: 'IconWallet',
																				hugeicons: 'WalletIcon',
																				phosphor: 'WalletIcon',
																				remixicon: 'RiWalletLine'
																			});

																			$$renderer.push(`<!----> PayPal`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.RadioItem) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.RadioItem($$renderer, {
																		value: 'bank',
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'Building2Icon',
																				tabler: 'IconBuildingBank',
																				hugeicons: 'BankIcon',
																				phosphor: 'BankIcon',
																				remixicon: 'RiBankLine'
																			});

																			$$renderer.push(`<!----> Bank Transfer`);
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
}