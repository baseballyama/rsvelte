import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-6"><div><h2 class="text-2xl font-semibold">Shipping Address</h2> <p class="text-muted-foreground text-sm">Please enter your delivery address</p></div> <div class="flex flex-col gap-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div></div> <div class="flex flex-col gap-2"><!> <!></div></div></div>`);
var root_3 = $.from_html(`<div class="flex w-full items-center justify-between"><span class="font-medium"> </span> <span class="text-muted-foreground text-sm"> </span></div> <span class="text-muted-foreground text-sm"> </span>`, 1);
var root_4 = $.from_html(`<div class="flex w-full flex-col gap-6"><div><h2 class="text-2xl font-semibold">Shipping Method</h2> <p class="text-muted-foreground text-sm">Select your preferred shipping option</p></div> <!></div>`);
var root_5 = $.from_html(`<div class="flex items-center gap-4"><div class="border-border flex size-4 items-center justify-center rounded-full border"><div class="group-data-[state=open]:bg-primary size-2 rounded-full"></div></div> <!> Pay with Card</div>`);
var root_6 = $.from_html(`<div class="flex flex-col gap-4 px-4 pt-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="flex gap-4"><div class="flex flex-1 flex-col gap-2"><!> <!></div> <div class="flex flex-1 flex-col gap-2"><!> <!></div></div> <div class="flex flex-col gap-2"><!> <!></div></div>`);
var root_7 = $.from_html(`<div class="flex items-center gap-4"><div class="border-border flex size-4 items-center justify-center rounded-full border"><div class="group-data-[state=open]:bg-primary size-2 rounded-full"></div></div> <!> Open Source Special</div>`);
var root_8 = $.from_html(`<div class="flex flex-col gap-4 px-4 pt-4">Nothing to pay just enjoy the free software!</div>`);
var root_9 = $.from_html(`<div class="flex w-full flex-col gap-6"><div><h2 class="text-2xl font-semibold">Payment Method</h2> <p class="text-muted-foreground text-sm">Choose how you'd like to pay</p></div> <!></div>`);
var root_10 = $.from_html(`<div class="flex flex-col gap-6"><div><h2 class="text-2xl font-semibold">Order Summary</h2> <p class="text-muted-foreground text-sm">Review your order details</p></div> <div class="rounded-lg border p-6"><div class="flex flex-col gap-4"><div><h3 class="font-semibold">Shipping Address</h3> <p class="text-muted-foreground text-sm"> <br/> </p></div> <div><h3 class="font-semibold">Shipping Method</h3> <p class="text-muted-foreground text-sm"> </p></div> <div><h3 class="font-semibold">Payment Method</h3> <p class="text-muted-foreground text-sm"> </p></div> <div class="flex flex-col gap-2 border-t pt-4"><div class="flex flex-col gap-2 border-b py-2"><div class="flex items-center justify-between"><p class="text-muted-foreground text-sm">Stepper Component</p> <p class="text-muted-foreground text-sm">$0.00</p></div></div> <div class="flex items-center justify-between"><span class="font-semibold">Order Total</span> <span class="text-lg font-bold">$0.00</span></div></div></div></div></div>`);
var root_11 = $.from_html(`<div class="flex w-full max-w-2xl flex-col gap-8 px-4"><!> <div class="min-h-[430px] w-full"><!></div> <div class="flex w-full justify-between gap-2"><!> <!></div></div>`);

export default function Stepper_form($$anchor, $$props) {
	$.push($$props, true);

	let step = $.state(1);
	let address = $.state($.proxy({ street: '', city: '', state: '', zip: '' }));
	let shippingMethod = $.state(undefined);
	let paymentMethod = $.state(undefined);

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
		if (!($.get(address).street && $.get(address).city && $.get(address).state && $.get(address).zip)) return 1;
		if (!$.get(shippingMethod)) return 2;
		if (!$.get(paymentMethod)) return 3;

		return 4;
	});

	const canGoToNextStep = $.derived(() => canProceedToStep($.get(step)));

	function canProceedToStep(currentStep) {
		return currentStep < $.get(maxValidStep);
	}

	function handleSubmit() {
		toast.success('Order confirmed!', {
			description: `Your order for the stepper component ($0) has been placed successfully.`
		});

		$.set(step, 1);
		$.set(address, { street: '', city: '', state: '', zip: '' }, true);
		$.set(shippingMethod, undefined);
		$.set(paymentMethod, undefined);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Stepper.Root, ($$anchor, Stepper_Root) => {
		Stepper_Root($$anchor, {
			get step() {
				return $.get(step);
			},

			set step($$value) {
				$.set(step, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var div = root_11();
				var node_1 = $.child(div);

				$.component(node_1, () => Stepper.Nav, ($$anchor, Stepper_Nav) => {
					Stepper_Nav($$anchor, {
						orientation: 'horizontal',
						class: 'justify-between',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Stepper.Item, ($$anchor, Stepper_Item) => {
								Stepper_Item($$anchor, {
									id: 'address',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => Stepper.Trigger, ($$anchor, Stepper_Trigger) => {
											Stepper_Trigger($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = $.comment();
													var node_4 = $.first_child(fragment_3);

													$.component(node_4, () => Stepper.Indicator, ($$anchor, Stepper_Indicator) => {
														Stepper_Indicator($$anchor, {
															children: ($$anchor, $$slotProps) => {
																BookUserIcon($$anchor, {});
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_3, 2);

										$.component(node_5, () => Stepper.Separator, ($$anchor, Stepper_Separator) => {
											Stepper_Separator($$anchor, {});
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_2, 2);

							$.component(node_6, () => Stepper.Item, ($$anchor, Stepper_Item_1) => {
								Stepper_Item_1($$anchor, {
									id: 'shipping',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_7 = $.first_child(fragment_5);

										{
											let $0 = $.derived(() => $.get(maxValidStep) < 2);

											$.component(node_7, () => Stepper.Trigger, ($$anchor, Stepper_Trigger_1) => {
												Stepper_Trigger_1($$anchor, {
													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_6 = $.comment();
														var node_8 = $.first_child(fragment_6);

														$.component(node_8, () => Stepper.Indicator, ($$anchor, Stepper_Indicator_1) => {
															Stepper_Indicator_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	TruckIcon($$anchor, {});
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});
										}

										var node_9 = $.sibling(node_7, 2);

										$.component(node_9, () => Stepper.Separator, ($$anchor, Stepper_Separator_1) => {
											Stepper_Separator_1($$anchor, {});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_6, 2);

							$.component(node_10, () => Stepper.Item, ($$anchor, Stepper_Item_2) => {
								Stepper_Item_2($$anchor, {
									id: 'payment',
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root();
										var node_11 = $.first_child(fragment_8);

										{
											let $0 = $.derived(() => $.get(maxValidStep) < 3);

											$.component(node_11, () => Stepper.Trigger, ($$anchor, Stepper_Trigger_2) => {
												Stepper_Trigger_2($$anchor, {
													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_9 = $.comment();
														var node_12 = $.first_child(fragment_9);

														$.component(node_12, () => Stepper.Indicator, ($$anchor, Stepper_Indicator_2) => {
															Stepper_Indicator_2($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	CreditCardIcon($$anchor, {});
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_9);
													},
													$$slots: { default: true }
												});
											});
										}

										var node_13 = $.sibling(node_11, 2);

										$.component(node_13, () => Stepper.Separator, ($$anchor, Stepper_Separator_2) => {
											Stepper_Separator_2($$anchor, {});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							var node_14 = $.sibling(node_10, 2);

							$.component(node_14, () => Stepper.Item, ($$anchor, Stepper_Item_3) => {
								Stepper_Item_3($$anchor, {
									id: 'checkout',
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = $.comment();
										var node_15 = $.first_child(fragment_11);

										{
											let $0 = $.derived(() => $.get(maxValidStep) < 4);

											$.component(node_15, () => Stepper.Trigger, ($$anchor, Stepper_Trigger_3) => {
												Stepper_Trigger_3($$anchor, {
													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_12 = $.comment();
														var node_16 = $.first_child(fragment_12);

														$.component(node_16, () => Stepper.Indicator, ($$anchor, Stepper_Indicator_3) => {
															Stepper_Indicator_3($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	ShoppingCartIcon($$anchor, {});
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_12);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var div_1 = $.sibling(node_1, 2);
				var node_17 = $.child(div_1);

				{
					var consequent = ($$anchor) => {
						var div_2 = root_2();
						var div_3 = $.sibling($.child(div_2), 2);
						var div_4 = $.child(div_3);
						var node_18 = $.child(div_4);

						Label(node_18, {
							for: 'street',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Street Address');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_19 = $.sibling(node_18, 2);

						Input(node_19, {
							id: 'street',
							placeholder: '123 Main St',
							get value() {
								return $.get(address).street;
							},

							set value($$value) {
								$.get(address).street = $$value;
							}
						});

						$.reset(div_4);

						var div_5 = $.sibling(div_4, 2);
						var div_6 = $.child(div_5);
						var node_20 = $.child(div_6);

						Label(node_20, {
							for: 'city',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('City');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_21 = $.sibling(node_20, 2);

						Input(node_21, {
							id: 'city',
							placeholder: 'New York',
							get value() {
								return $.get(address).city;
							},

							set value($$value) {
								$.get(address).city = $$value;
							}
						});

						$.reset(div_6);

						var div_7 = $.sibling(div_6, 2);
						var node_22 = $.child(div_7);

						Label(node_22, {
							for: 'state',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('State');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						var node_23 = $.sibling(node_22, 2);

						Input(node_23, {
							id: 'state',
							placeholder: 'NY',
							get value() {
								return $.get(address).state;
							},

							set value($$value) {
								$.get(address).state = $$value;
							}
						});

						$.reset(div_7);
						$.reset(div_5);

						var div_8 = $.sibling(div_5, 2);
						var node_24 = $.child(div_8);

						Label(node_24, {
							for: 'zip',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('ZIP Code');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});

						var node_25 = $.sibling(node_24, 2);

						Input(node_25, {
							id: 'zip',
							placeholder: '10001',
							get value() {
								return $.get(address).zip;
							},

							set value($$value) {
								$.get(address).zip = $$value;
							}
						});

						$.reset(div_8);
						$.reset(div_3);
						$.reset(div_2);
						$.append($$anchor, div_2);
					};

					var consequent_1 = ($$anchor) => {
						var div_9 = root_4();
						var node_26 = $.sibling($.child(div_9), 2);

						$.component(node_26, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
							ToggleGroup_Root($$anchor, {
								type: 'single',
								class: 'flex w-full flex-col gap-3',
								get value() {
									return $.get(shippingMethod);
								},

								set value($$value) {
									$.set(shippingMethod, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_14 = $.comment();
									var node_27 = $.first_child(fragment_14);

									$.each(node_27, 17, () => shippingOptions, (option) => option.value, ($$anchor, option) => {
										var fragment_15 = $.comment();
										var node_28 = $.first_child(fragment_15);

										$.component(node_28, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
											ToggleGroup_Item($$anchor, {
												get value() {
													return $.get(option).value;
												},
												class: 'hover:text-foreground data-[state=on]:border-primary data-[state=on]:bg-accent flex h-auto w-full flex-col items-start gap-2 rounded-lg border p-4 transition-colors',
												children: ($$anchor, $$slotProps) => {
													var fragment_16 = root_3();
													var div_10 = $.first_child(fragment_16);
													var span = $.child(div_10);
													var text_4 = $.only_child(span, true);
													var span_1 = $.sibling(span, 2);
													var text_5 = $.only_child(span_1, true);

													$.reset(div_10);

													var span_2 = $.sibling(div_10, 2);
													var text_6 = $.only_child(span_2, true);

													$.template_effect(() => {
														$.set_text(text_4, $.get(option).label);
														$.set_text(text_5, $.get(option).price);
														$.set_text(text_6, $.get(option).delivery);
													});

													$.append($$anchor, fragment_16);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_15);
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_9);
						$.append($$anchor, div_9);
					};

					var consequent_2 = ($$anchor) => {
						var div_11 = root_9();
						var node_29 = $.sibling($.child(div_11), 2);

						$.component(node_29, () => Accordion.Root, ($$anchor, Accordion_Root) => {
							Accordion_Root($$anchor, {
								type: 'single',
								class: 'border-border rounded-lg border',
								get value() {
									return $.get(paymentMethod);
								},

								set value($$value) {
									$.set(paymentMethod, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root();
									var node_30 = $.first_child(fragment_17);

									$.component(node_30, () => Accordion.Item, ($$anchor, Accordion_Item) => {
										Accordion_Item($$anchor, {
											value: 'card',
											children: ($$anchor, $$slotProps) => {
												var fragment_18 = root();
												var node_31 = $.first_child(fragment_18);

												$.component(node_31, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
													Accordion_Trigger($$anchor, {
														class: 'group rounded-b-none px-4 hover:no-underline data-[state=open]:border-b [&_svg:not([class*=\'show\'])]:hidden',
														children: ($$anchor, $$slotProps) => {
															var div_12 = root_5();
															var node_32 = $.sibling($.child(div_12), 2);

															CreditCardIcon(node_32, { class: 'show text-muted-foreground' });
															$.next();
															$.reset(div_12);
															$.append($$anchor, div_12);
														},
														$$slots: { default: true }
													});
												});

												var node_33 = $.sibling(node_31, 2);

												$.component(node_33, () => Accordion.Content, ($$anchor, Accordion_Content) => {
													Accordion_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var div_13 = root_6();
															var div_14 = $.child(div_13);
															var node_34 = $.child(div_14);

															Label(node_34, {
																for: 'card-number',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_7 = $.text('Card Number');

																	$.append($$anchor, text_7);
																},
																$$slots: { default: true }
															});

															var node_35 = $.sibling(node_34, 2);

															Input(node_35, { id: 'card-number', placeholder: '1234 5678 9012 3456' });
															$.reset(div_14);

															var div_15 = $.sibling(div_14, 2);
															var div_16 = $.child(div_15);
															var node_36 = $.child(div_16);

															Label(node_36, {
																for: 'expiry',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_8 = $.text('Expiry Date');

																	$.append($$anchor, text_8);
																},
																$$slots: { default: true }
															});

															var node_37 = $.sibling(node_36, 2);

															Input(node_37, { id: 'expiry', placeholder: 'MM/YY' });
															$.reset(div_16);

															var div_17 = $.sibling(div_16, 2);
															var node_38 = $.child(div_17);

															Label(node_38, {
																for: 'cvv',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_9 = $.text('CVV');

																	$.append($$anchor, text_9);
																},
																$$slots: { default: true }
															});

															var node_39 = $.sibling(node_38, 2);

															Input(node_39, { id: 'cvv', placeholder: '123' });
															$.reset(div_17);
															$.reset(div_15);

															var div_18 = $.sibling(div_15, 2);
															var node_40 = $.child(div_18);

															Label(node_40, {
																for: 'cardholder-name',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_10 = $.text('Cardholder Name');

																	$.append($$anchor, text_10);
																},
																$$slots: { default: true }
															});

															var node_41 = $.sibling(node_40, 2);

															Input(node_41, { id: 'cardholder-name', placeholder: 'John Doe' });
															$.reset(div_18);
															$.reset(div_13);
															$.append($$anchor, div_13);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_18);
											},
											$$slots: { default: true }
										});
									});

									var node_42 = $.sibling(node_30, 2);

									$.component(node_42, () => Accordion.Item, ($$anchor, Accordion_Item_1) => {
										Accordion_Item_1($$anchor, {
											value: 'open-source-special',
											children: ($$anchor, $$slotProps) => {
												var fragment_19 = root();
												var node_43 = $.first_child(fragment_19);

												$.component(node_43, () => Accordion.Trigger, ($$anchor, Accordion_Trigger_1) => {
													Accordion_Trigger_1($$anchor, {
														class: 'group rounded-b-none px-4 hover:no-underline data-[state=open]:border-b [&_svg:not([class*=\'show\'])]:hidden',
														children: ($$anchor, $$slotProps) => {
															var div_19 = root_7();
															var node_44 = $.sibling($.child(div_19), 2);

															SmileIcon(node_44, { class: 'show text-muted-foreground' });
															$.next();
															$.reset(div_19);
															$.append($$anchor, div_19);
														},
														$$slots: { default: true }
													});
												});

												var node_45 = $.sibling(node_43, 2);

												$.component(node_45, () => Accordion.Content, ($$anchor, Accordion_Content_1) => {
													Accordion_Content_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var div_20 = root_8();

															$.append($$anchor, div_20);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_19);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_11);
						$.append($$anchor, div_11);
					};

					var consequent_3 = ($$anchor) => {
						var div_21 = root_10();
						var div_22 = $.sibling($.child(div_21), 2);
						var div_23 = $.child(div_22);
						var div_24 = $.child(div_23);
						var p = $.sibling($.child(div_24), 2);
						var text_11 = $.child(p, true);
						var text_12 = $.sibling(text_11, 2);

						$.reset(p);
						$.reset(div_24);

						var div_25 = $.sibling(div_24, 2);
						var p_1 = $.sibling($.child(div_25), 2);
						var text_13 = $.only_child(p_1, true);

						$.reset(div_25);

						var div_26 = $.sibling(div_25, 2);
						var p_2 = $.sibling($.child(div_26), 2);
						var text_14 = $.only_child(p_2, true);

						$.reset(div_26);
						$.next(2);
						$.reset(div_23);
						$.reset(div_22);
						$.reset(div_21);

						$.template_effect(
							($0, $1) => {
								$.set_text(text_11, $.get(address).street);

								$.set_text(text_12, ` ${$.get(address).city ?? ''}, ${$.get(address).state ?? ''}
									${$.get(address).zip ?? ''}`);

								$.set_text(text_13, $0);
								$.set_text(text_14, $1);
							},
							[
								() => shippingOptions.find((o) => o.value === $.get(shippingMethod))?.label,
								() => paymentOptions.find((o) => o.value === $.get(paymentMethod))?.label
							]
						);

						$.append($$anchor, div_21);
					};

					$.if(node_17, ($$render) => {
						if ($.get(step) === 1) $$render(consequent); else if ($.get(step) === 2) $$render(consequent_1, 1); else if ($.get(step) === 3) $$render(consequent_2, 2); else if ($.get(step) === 4) $$render(consequent_3, 3);
					});
				}

				$.reset(div_1);

				var div_27 = $.sibling(div_1, 2);
				var node_46 = $.child(div_27);

				$.component(node_46, () => Stepper.Previous, ($$anchor, Stepper_Previous) => {
					Stepper_Previous($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text('Previous');

							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});
				});

				var node_47 = $.sibling(node_46, 2);

				{
					var consequent_4 = ($$anchor) => {
						var fragment_20 = $.comment();
						var node_48 = $.first_child(fragment_20);

						{
							let $0 = $.derived(() => !$.get(canGoToNextStep));

							$.component(node_48, () => Stepper.Next, ($$anchor, Stepper_Next) => {
								Stepper_Next($$anchor, {
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_16 = $.text('Next');

										$.append($$anchor, text_16);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_20);
					};

					var alternate = ($$anchor) => {
						Button($$anchor, {
							onclick: handleSubmit,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_17 = $.text('Complete Order');

								$.append($$anchor, text_17);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_47, ($$render) => {
						if ($.get(step) < 4) $$render(consequent_4); else $$render(alternate, -1);
					});
				}

				$.reset(div_27);
				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}