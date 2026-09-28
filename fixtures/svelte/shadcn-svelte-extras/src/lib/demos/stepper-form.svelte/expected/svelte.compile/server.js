import * as $ from 'svelte/internal/server';
import * as Stepper from '$lib/components/ui/stepper';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import Button from '$lib/components/button.svelte';
import * as ToggleGroup from '$lib/components/ui/toggle-group';
import { toast } from 'svelte-sonner';

import {
	BookUserIcon,
	TruckIcon,
	CreditCardIcon,
	ShoppingCartIcon,
	SmileIcon
} from '@lucide/svelte';

import * as Accordion from '$lib/components/ui/accordion';

export default function Stepper_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let step = 1;
		let address = { street: '', city: '', state: '', zip: '' };
		let shippingMethod = undefined;
		let paymentMethod = undefined;

		const shippingOptions = [
			{
				value: 'standard',
				label: 'Standard Shipping',
				price: 'Free',
				delivery: '5-7 business days'
			},

			{
				value: 'express',
				label: 'Express Shipping',
				price: '$9.99',
				delivery: '2-3 business days'
			},

			{
				value: 'overnight',
				label: 'Overnight Shipping',
				price: '$19.99',
				delivery: 'Next business day'
			}
		];

		const paymentOptions = [
			{ value: 'card', label: 'Card' },
			{ value: 'open-source-special', label: 'Open Source Special' }
		];

		const maxValidStep = $.derived(() => {
			if (!(address.street && address.city && address.state && address.zip)) return 1;
			if (!shippingMethod) return 2;
			if (!paymentMethod) return 3;

			return 4;
		});

		const canGoToNextStep = $.derived(() => canProceedToStep(step));

		function canProceedToStep(currentStep) {
			return currentStep < maxValidStep();
		}

		function handleSubmit() {
			toast.success('Order confirmed!', {
				description: `Your order for the stepper component ($0) has been placed successfully.`
			});

			step = 1;
			address = { street: '', city: '', state: '', zip: '' };
			shippingMethod = undefined;
			paymentMethod = undefined;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Stepper.Root) {
				$$renderer.push('<!--[-->');

				Stepper.Root($$renderer, {
					get step() {
						return step;
					},

					set step($$value) {
						step = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<div class="flex w-full max-w-2xl flex-col gap-8 px-4">`);

						if (Stepper.Nav) {
							$$renderer.push('<!--[-->');

							Stepper.Nav($$renderer, {
								orientation: 'horizontal',
								class: 'justify-between',
								children: ($$renderer) => {
									if (Stepper.Item) {
										$$renderer.push('<!--[-->');

										Stepper.Item($$renderer, {
											id: 'address',
											children: ($$renderer) => {
												if (Stepper.Trigger) {
													$$renderer.push('<!--[-->');

													Stepper.Trigger($$renderer, {
														children: ($$renderer) => {
															if (Stepper.Indicator) {
																$$renderer.push('<!--[-->');

																Stepper.Indicator($$renderer, {
																	children: ($$renderer) => {
																		BookUserIcon($$renderer, {});
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

												if (Stepper.Separator) {
													$$renderer.push('<!--[-->');
													Stepper.Separator($$renderer, {});
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

									if (Stepper.Item) {
										$$renderer.push('<!--[-->');

										Stepper.Item($$renderer, {
											id: 'shipping',
											children: ($$renderer) => {
												if (Stepper.Trigger) {
													$$renderer.push('<!--[-->');

													Stepper.Trigger($$renderer, {
														disabled: maxValidStep() < 2,
														children: ($$renderer) => {
															if (Stepper.Indicator) {
																$$renderer.push('<!--[-->');

																Stepper.Indicator($$renderer, {
																	children: ($$renderer) => {
																		TruckIcon($$renderer, {});
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

												if (Stepper.Separator) {
													$$renderer.push('<!--[-->');
													Stepper.Separator($$renderer, {});
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

									if (Stepper.Item) {
										$$renderer.push('<!--[-->');

										Stepper.Item($$renderer, {
											id: 'payment',
											children: ($$renderer) => {
												if (Stepper.Trigger) {
													$$renderer.push('<!--[-->');

													Stepper.Trigger($$renderer, {
														disabled: maxValidStep() < 3,
														children: ($$renderer) => {
															if (Stepper.Indicator) {
																$$renderer.push('<!--[-->');

																Stepper.Indicator($$renderer, {
																	children: ($$renderer) => {
																		CreditCardIcon($$renderer, {});
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

												if (Stepper.Separator) {
													$$renderer.push('<!--[-->');
													Stepper.Separator($$renderer, {});
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

									if (Stepper.Item) {
										$$renderer.push('<!--[-->');

										Stepper.Item($$renderer, {
											id: 'checkout',
											children: ($$renderer) => {
												if (Stepper.Trigger) {
													$$renderer.push('<!--[-->');

													Stepper.Trigger($$renderer, {
														disabled: maxValidStep() < 4,
														children: ($$renderer) => {
															if (Stepper.Indicator) {
																$$renderer.push('<!--[-->');

																Stepper.Indicator($$renderer, {
																	children: ($$renderer) => {
																		ShoppingCartIcon($$renderer, {});
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

						$$renderer.push(` <div class="min-h-[430px] w-full">`);

						if (step === 1) {
							$$renderer.push(`<!--[0--><div class="flex flex-col gap-6"><div><h2 class="text-2xl font-semibold">Shipping Address</h2> <p class="text-muted-foreground text-sm">Please enter your delivery address</p></div> <div class="flex flex-col gap-4"><div class="flex flex-col gap-2">`);

							Label($$renderer, {
								for: 'street',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Street Address`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Input($$renderer, {
								id: 'street',
								placeholder: '123 Main St',
								get value() {
									return address.street;
								},

								set value($$value) {
									address.street = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

							Label($$renderer, {
								for: 'city',
								children: ($$renderer) => {
									$$renderer.push(`<!---->City`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Input($$renderer, {
								id: 'city',
								placeholder: 'New York',
								get value() {
									return address.city;
								},

								set value($$value) {
									address.city = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);

							Label($$renderer, {
								for: 'state',
								children: ($$renderer) => {
									$$renderer.push(`<!---->State`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Input($$renderer, {
								id: 'state',
								placeholder: 'NY',
								get value() {
									return address.state;
								},

								set value($$value) {
									address.state = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----></div></div> <div class="flex flex-col gap-2">`);

							Label($$renderer, {
								for: 'zip',
								children: ($$renderer) => {
									$$renderer.push(`<!---->ZIP Code`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Input($$renderer, {
								id: 'zip',
								placeholder: '10001',
								get value() {
									return address.zip;
								},

								set value($$value) {
									address.zip = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----></div></div></div>`);
						} else if (step === 2) {
							$$renderer.push(`<!--[1--><div class="flex w-full flex-col gap-6"><div><h2 class="text-2xl font-semibold">Shipping Method</h2> <p class="text-muted-foreground text-sm">Select your preferred shipping option</p></div> `);

							if (ToggleGroup.Root) {
								$$renderer.push('<!--[-->');

								ToggleGroup.Root($$renderer, {
									type: 'single',
									class: 'flex w-full flex-col gap-3',
									get value() {
										return shippingMethod;
									},

									set value($$value) {
										shippingMethod = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(shippingOptions);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let option = each_array[$$index];

											if (ToggleGroup.Item) {
												$$renderer.push('<!--[-->');

												ToggleGroup.Item($$renderer, {
													value: option.value,
													class: 'hover:text-foreground data-[state=on]:border-primary data-[state=on]:bg-accent flex h-auto w-full flex-col items-start gap-2 rounded-lg border p-4 transition-colors',
													children: ($$renderer) => {
														$$renderer.push(`<div class="flex w-full items-center justify-between"><span class="font-medium">${$.escape(option.label)}</span> <span class="text-muted-foreground text-sm">${$.escape(option.price)}</span></div> <span class="text-muted-foreground text-sm">${$.escape(option.delivery)}</span>`);
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

							$$renderer.push(`</div>`);
						} else if (step === 3) {
							$$renderer.push(`<!--[2--><div class="flex w-full flex-col gap-6"><div><h2 class="text-2xl font-semibold">Payment Method</h2> <p class="text-muted-foreground text-sm">Choose how you'd like to pay</p></div> `);

							if (Accordion.Root) {
								$$renderer.push('<!--[-->');

								Accordion.Root($$renderer, {
									type: 'single',
									class: 'border-border rounded-lg border',
									get value() {
										return paymentMethod;
									},

									set value($$value) {
										paymentMethod = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										if (Accordion.Item) {
											$$renderer.push('<!--[-->');

											Accordion.Item($$renderer, {
												value: 'card',
												children: ($$renderer) => {
													if (Accordion.Trigger) {
														$$renderer.push('<!--[-->');

														Accordion.Trigger($$renderer, {
															class: 'group rounded-b-none px-4 hover:no-underline data-[state=open]:border-b [&_svg:not([class*=\'show\'])]:hidden',
															children: ($$renderer) => {
																$$renderer.push(`<div class="flex items-center gap-4"><div class="border-border flex size-4 items-center justify-center rounded-full border"><div class="group-data-[state=open]:bg-primary size-2 rounded-full"></div></div> `);
																CreditCardIcon($$renderer, { class: 'show text-muted-foreground' });
																$$renderer.push(`<!----> Pay with Card</div>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Accordion.Content) {
														$$renderer.push('<!--[-->');

														Accordion.Content($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<div class="flex flex-col gap-4 px-4 pt-4"><div class="flex flex-col gap-2">`);

																Label($$renderer, {
																	for: 'card-number',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Card Number`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> `);
																Input($$renderer, { id: 'card-number', placeholder: '1234 5678 9012 3456' });
																$$renderer.push(`<!----></div> <div class="flex gap-4"><div class="flex flex-1 flex-col gap-2">`);

																Label($$renderer, {
																	for: 'expiry',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Expiry Date`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> `);
																Input($$renderer, { id: 'expiry', placeholder: 'MM/YY' });
																$$renderer.push(`<!----></div> <div class="flex flex-1 flex-col gap-2">`);

																Label($$renderer, {
																	for: 'cvv',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->CVV`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> `);
																Input($$renderer, { id: 'cvv', placeholder: '123' });
																$$renderer.push(`<!----></div></div> <div class="flex flex-col gap-2">`);

																Label($$renderer, {
																	for: 'cardholder-name',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Cardholder Name`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> `);
																Input($$renderer, { id: 'cardholder-name', placeholder: 'John Doe' });
																$$renderer.push(`<!----></div></div>`);
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

										if (Accordion.Item) {
											$$renderer.push('<!--[-->');

											Accordion.Item($$renderer, {
												value: 'open-source-special',
												children: ($$renderer) => {
													if (Accordion.Trigger) {
														$$renderer.push('<!--[-->');

														Accordion.Trigger($$renderer, {
															class: 'group rounded-b-none px-4 hover:no-underline data-[state=open]:border-b [&_svg:not([class*=\'show\'])]:hidden',
															children: ($$renderer) => {
																$$renderer.push(`<div class="flex items-center gap-4"><div class="border-border flex size-4 items-center justify-center rounded-full border"><div class="group-data-[state=open]:bg-primary size-2 rounded-full"></div></div> `);
																SmileIcon($$renderer, { class: 'show text-muted-foreground' });
																$$renderer.push(`<!----> Open Source Special</div>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Accordion.Content) {
														$$renderer.push('<!--[-->');

														Accordion.Content($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<div class="flex flex-col gap-4 px-4 pt-4">Nothing to pay just enjoy the free software!</div>`);
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
						} else if (step === 4) {
							$$renderer.push(`<!--[3--><div class="flex flex-col gap-6"><div><h2 class="text-2xl font-semibold">Order Summary</h2> <p class="text-muted-foreground text-sm">Review your order details</p></div> <div class="rounded-lg border p-6"><div class="flex flex-col gap-4"><div><h3 class="font-semibold">Shipping Address</h3> <p class="text-muted-foreground text-sm">${$.escape(address.street)}<br/> ${$.escape(address.city)}, ${$.escape(address.state)}
									${$.escape(address.zip)}</p></div> <div><h3 class="font-semibold">Shipping Method</h3> <p class="text-muted-foreground text-sm">${$.escape(shippingOptions.find((o) => o.value === shippingMethod)?.label)}</p></div> <div><h3 class="font-semibold">Payment Method</h3> <p class="text-muted-foreground text-sm">${$.escape(paymentOptions.find((o) => o.value === paymentMethod)?.label)}</p></div> <div class="flex flex-col gap-2 border-t pt-4"><div class="flex flex-col gap-2 border-b py-2"><div class="flex items-center justify-between"><p class="text-muted-foreground text-sm">Stepper Component</p> <p class="text-muted-foreground text-sm">$0.00</p></div></div> <div class="flex items-center justify-between"><span class="font-semibold">Order Total</span> <span class="text-lg font-bold">$0.00</span></div></div></div></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="flex w-full justify-between gap-2">`);

						if (Stepper.Previous) {
							$$renderer.push('<!--[-->');

							Stepper.Previous($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Previous`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (step < 4) {
							$$renderer.push('<!--[0-->');

							if (Stepper.Next) {
								$$renderer.push('<!--[-->');

								Stepper.Next($$renderer, {
									disabled: !canGoToNextStep(),
									children: ($$renderer) => {
										$$renderer.push(`<!---->Next`);
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

							Button($$renderer, {
								onclick: handleSubmit,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Complete Order`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div></div>`);
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
	});
}