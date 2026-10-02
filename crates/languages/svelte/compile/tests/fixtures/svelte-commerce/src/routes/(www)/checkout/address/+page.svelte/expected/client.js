import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { goto } from '$app/navigation';

import {
	ChevronRight,
	LoaderCircle,
	LockKeyhole,
	MapPin,
	Pencil,
	ShoppingBag,
	Truck
} from '@lucide/svelte';

import { formatPrice } from '$lib/core/utils/index.js';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';
import AddressListModal from '$lib/components/address/address-list-modal.svelte';
import AddressFormModal from '$lib/components/address/address-form-modal.svelte';
import { page } from '$app/state';
import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import OrderTrustBadges from '$lib/core/components/plugins/order-trust-badges.svelte';
import { showAuthModal } from '$lib/core/components/index.js';
import Textbox from '$lib/components/form/textbox.svelte';

import {
	AddressModule,
	emptyAddress,
	checkoutAddressSchema as schemas
} from '$lib/core/composables/index.js';

import CheckoutHeader from '$lib/components/checkout/checkout-header.svelte';
import { appendOneTimeCartId } from '$lib/core/utils/index.js';
import CheckoutButton from '$lib/components/buttons/checkout-button.svelte';
import AddressForm from './address-form.svelte';
import { authService } from '$lib/core/services/index.js';
import { toast } from '@misiki/kitcommerce-core';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="flex h-96 flex-col items-center justify-center gap-3"><p class="text-xl text-gray-400">You must select at least one item in cart for checkout</p> <!></div>`);
var root_1 = $.from_html(`<div class="flex h-96 flex-col items-center justify-center gap-3"><p class="text-xl text-gray-400">Your cart is empty</p> <!></div>`);
var root_2 = $.from_html(`<div class="rounded-lg border border-blue-100 bg-blue-50 p-4"><div class="flex items-start gap-3"><!> <div><p class="text-sm font-semibold text-blue-900">You're checking out as a guest</p> <p class="mt-1 text-sm text-blue-800">No account needed — just enter your details below. Optionally, <button class="font-bold underline hover:text-blue-900">log in</button> to use your saved addresses and speed up checkout.</p></div></div></div>`);
var root_3 = $.from_html(`<!> <span>Edit</span>`, 1);
var root_4 = $.from_html(`<div class="grid grid-cols-1 gap-6 p-6 transition-all duration-500 sm:grid-cols-2"><div class="flex flex-col gap-1"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Email Address</p> <p class="text-sm font-medium text-gray-900"> </p></div> <div class="flex flex-col gap-1"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Phone Number</p> <p class="text-sm font-medium text-gray-900"> </p></div></div>`);
var root_5 = $.from_html(`<span class="text-gray-400">(optional)</span>`);
var root_6 = $.from_html(`<form class="space-y-4 p-5 transition-all duration-500"><div class="space-y-1"><label for="email" class="block text-sm font-medium text-gray-700">Email address <!></label> <!> <p class="mt-1 text-xs text-gray-500">We'll send order confirmation to this email</p></div> <div class="space-y-1"><label for="phone" class="block text-sm font-medium text-gray-700">Phone number <!></label> <!> <p class="mt-1 text-xs text-gray-500">For delivery updates</p></div> <div class="flex justify-end space-x-3 pt-2"><!> <!></div></form>`);
var root_7 = $.from_html(`<div class="overflow-hidden rounded-lg border border-border bg-background shadow-sm"><div class="flex items-center justify-between border-b border-border px-5 py-4"><div class="flex items-center space-x-3"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Contact Details</h2></div> <!></div> <!></div>`);
var root_8 = $.from_html(`<div class="p-6"><div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Delivery Address</h2> <!></div> <!></div>`);
var root_9 = $.from_html(`<div class="p-6"><!></div>`);
var root_10 = $.from_html(`<p> </p>`);
var root_11 = $.from_html(`<div class="p-6 transition-all duration-500"><div class="mb-4 flex items-center"><!> <h3 class="text-sm font-bold uppercase tracking-tight text-gray-900"> </h3></div> <div class="space-y-1 text-sm leading-relaxed text-gray-600"><p> </p> <!> <p> </p> <p> </p> <p class="mt-4 border-border pt-4 font-medium"><span class="mr-2 text-[10px] font-bold uppercase tracking-tighter text-gray-400">Phone</span> </p></div></div>`);
var root_12 = $.from_html(`<div><div class="flex items-center justify-between border-b border-border px-5 py-4"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Delivery Address</h2> <!></div> <!></div>`);
var root_13 = $.from_html(`<div class="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 py-8 text-center transition-all duration-300 hover:bg-gray-100/50"><p class="mb-6 text-sm text-gray-500">No shipping address selected</p> <!></div>`);
var root_14 = $.from_html(`<div class="p-6"><div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><h2 class="text-base font-bold uppercase tracking-widest text-gray-900" style="font-family: var(--font-body);">Shipping Address</h2> <!></div> <form><!></form></div>`);
var root_15 = $.from_html(`<div class="p-6 transition-all duration-500"><div class="mb-4 flex items-center"><!> <h3 class="text-sm font-bold uppercase tracking-tight text-gray-900"> </h3></div> <div class="space-y-1 text-sm leading-relaxed text-gray-600"><p> </p> <!> <p> </p> <p> </p> <p class="mt-4 border-t border-gray-50 pt-4 font-medium"><span class="mr-2 text-[10px] font-bold uppercase tracking-tighter text-gray-400">Phone</span> </p></div></div>`);
var root_16 = $.from_html(`<div class="bg-gray-50 p-8 text-center transition-all duration-500"><p class="text-sm text-gray-500">No billing address saved.</p></div>`);
var root_17 = $.from_html(`<div class="overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-all duration-300"><div><div class="flex items-center justify-between border-b border-border px-5 py-4"><h2 class="text-base font-bold uppercase  text-gray-900" style="font-family: var(--font-body);">Billing Address</h2> <!></div> <!></div></div>`);
var root_18 = $.from_html(`<div class="flex items-center justify-start gap-2 p-4 transition-all hover:bg-gray-100"><!> <label for="isBillingAddressSameAsShipping" class="cursor-pointer text-xs font-bold uppercase tracking-tight text-gray-700">Billing address same as shipping</label></div>`);
var root_19 = $.from_html(`<div class="overflow-hidden rounded-lg border border-border bg-background shadow-sm"><!></div> <!> <!>`, 1);
var root_20 = $.from_html(`<div class="flex items-center justify-center py-8"><!></div>`);
var root_21 = $.from_html(`<div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Discount</span> <span class="font-bold uppercase tracking-tight text-orange-600"> </span></div>`);
var root_22 = $.from_html(`<span class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Address required</span>`);
var root_23 = $.from_html(`<span class="font-bold text-gray-900"> </span>`);
var root_24 = $.from_html(`<span class="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-600 ring-1 ring-green-100">FREE</span>`);
var root_25 = $.from_html(`<div class="mt-4 rounded bg-red-50 p-3 text-[11px] font-bold uppercase tracking-tight text-red-600 ring-1 ring-red-100"> </div>`);
var root_26 = $.from_html(`<div class="space-y-4"><div class="space-y-3 border-b border-border pb-6"><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Subtotal</span> <span class="font-bold text-gray-900"> </span></div> <!> <div class="flex flex-col gap-1"><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Shipping</span> <!></div></div></div> <div class="flex items-center justify-between pt-2"><span class="text-sm font-bold uppercase text-gray-900">Total</span> <span class="text-xl font-bold text-gray-900"> </span></div> <!> <div class="mt-6 flex items-center justify-center gap-2 rounded-md border border-gray-100 bg-gray-50/50 px-4 py-3 transition-all hover:bg-gray-100/80"><!> <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure 256-bit encryption</p></div> <!></div>`);
var root_27 = $.from_html(`<div class="grid gap-8 lg:grid-cols-[1fr_400px]"><div class="space-y-6"><!> <!> <!></div> <div class="space-y-4"><div class="space-y-4 rounded-lg border border-border bg-background p-6 shadow-sm"><div class="mb-6 flex flex-col gap-1"><h2 class="text-base font-bold uppercase  text-gray-900" style="font-family: var(--font-body);">Price Summary</h2> <div class="h-1 w-12 bg-primary"></div></div> <!></div> <!></div></div>`);
var root_28 = $.from_html(`<div class="flex min-h-96 items-center justify-center py-8"><!></div>`);
var root_29 = $.from_html(`<div class="min-h-screen py-8"><div class="container mx-auto px-4"><!> <!></div></div> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const addressModule = new AddressModule();
	const cartState = addressModule.cartState;
	const userState = addressModule.userState;
	const isEmailOk = $.derived(() => addressModule.isEmailOk);
	const isPhoneOk = $.derived(() => addressModule.isPhoneOk);

	// `saveContactInfo` runs its zod `.parse()` calls BEFORE opening its own try block, so an
	// invalid or missing email/phone throws straight out of the handler: no toast, no inline
	// error, the button just does nothing and the shopper is stuck at the first step of checkout.
	async function saveContactInfo(e) {
		try {
			await addressModule.saveContactInfo(e);
		} catch(err) {
			toast.error(err?.issues?.[0]?.message || err?.message || 'Please check your email and phone number');
		}
	}

	// Two problems with the raw handler: a saved address disappeared on a single tap with no
	// confirmation, and it filters the address out of the list OUTSIDE its try/catch — so a failed
	// delete still removed it from the UI and it reappeared on the next reload. `paginateAddress`
	// merges the server list back in (deduped by id), which self-corrects: a delete that failed
	// puts the row back, one that succeeded leaves it gone.
	async function deleteAddress(address) {
		const where = [address?.address_1, address?.city].filter(Boolean).join(', ');

		if (!confirm(`Delete this address?${where ? `\n\n${where}` : ''}`)) return;

		await addressModule.handleDeleteAddress(address);
		await addressModule.paginateAddress(1);
	}

	const isGuestCheckout = $.derived(() => !userState?.user?.role);
	let loadingForGuestCheckout = $.state(false);

	// Coming back from the payment step: prefill the guest form with the saved
	// address so it can be edited in place.
	onMount(async () => {
		await cartState.hasLoaded;

		if ($.get(isGuestCheckout)) {
			if (cartState.cart.shippingAddress) {
				addressModule.currentAddress = cartState.cart.shippingAddress;
				addressModule.currentAddressType = 'shipping';
				addressModule.isBillingAddressSameAsShipping = true;
			}
		}
	});

	async function handleGuestSubmit(address) {
		try {
			$.set(loadingForGuestCheckout, true);
			await cartState.updateEmail({ email: address.email, phone: address.phone });

			// saveAddressToCart (not handleFormSave) so the save is actually awaited.
			await addressModule.saveAddressToCart();

			if (!cartState.cart.shippingAddress) {
				// A stale auth session (connect.sid) makes the API stamp user_id=0 on the
				// address insert and 500. Guests don't need that session — drop it and retry.
				await authService.logout().catch(() => {});

				await addressModule.saveAddressToCart();
			}

			if ($.get(isPhoneOk) && $.get(isEmailOk) && cartState.cart.shippingAddress && !addressModule.editAddress) {
				await addressModule.handleProceedToPayment();
			}
		} finally {
			$.set(loadingForGuestCheckout, false);
		}
	}

	var fragment = root_29();

	$.head('gashdp', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `Address - ${(page?.data?.store?.name || '') ?? ''}`;
		});
	});

	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	CheckoutHeader(node, { step: 2 });

	var node_1 = $.sibling(node, 2);

	$.await(
		node_1,
		() => cartState.hasLoaded,
		($$anchor) => {
			var div_50 = root_28();
			var node_48 = $.child(div_50);

			LoaderCircle(node_48, { class: 'animate-spin' });
			$.reset(div_50);
			$.append($$anchor, div_50);
		},
		($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var div_2 = root();
					var node_3 = $.sibling($.child(div_2), 2);

					{
						let $0 = $.derived(() => appendOneTimeCartId('/checkout/cart'));

						Button(node_3, {
							variant: 'outline',
							get href() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Go back to cart');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					}

					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				var consequent_1 = ($$anchor) => {
					var div_3 = root_1();
					var node_4 = $.sibling($.child(div_3), 2);

					Button(node_4, {
						variant: 'outline',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Continue Shopping');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_3);
					$.append($$anchor, div_3);
				};

				var alternate_8 = ($$anchor) => {
					var div_4 = root_27();
					var div_5 = $.child(div_4);
					var node_5 = $.child(div_5);

					$.await(node_5, () => userState.hasLoaded, null, ($$anchor, _) => {
						var fragment_2 = $.comment();
						var node_6 = $.first_child(fragment_2);

						{
							var consequent_2 = ($$anchor) => {
								var div_6 = root_2();
								var div_7 = $.child(div_6);
								var node_7 = $.child(div_7);

								ShoppingBag(node_7, { class: 'mt-0.5 size-5 shrink-0 text-blue-600' });

								var div_8 = $.sibling(node_7, 2);
								var p = $.sibling($.child(div_8), 2);
								var button = $.sibling($.child(p));

								$.next();
								$.reset(p);
								$.reset(div_8);
								$.reset(div_7);
								$.reset(div_6);

								$.delegated('click', button, () => {
									showAuthModal('login');
								});

								$.append($$anchor, div_6);
							};

							$.if(node_6, ($$render) => {
								if (!userState.user?.userId) $$render(consequent_2);
							});
						}

						$.append($$anchor, fragment_2);
					});

					var node_8 = $.sibling(node_5, 2);

					{
						var consequent_10 = ($$anchor) => {
							var div_9 = root_7();
							var div_10 = $.child(div_9);
							var node_9 = $.sibling($.child(div_10), 2);

							{
								var consequent_3 = ($$anchor) => {
									Button($$anchor, {
										get onclick() {
											return addressModule.handleEditEmail;
										},
										variant: 'ghost',
										size: 'sm',
										class: 'h-8',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_3();
											var node_10 = $.first_child(fragment_4);

											Pencil(node_10, { class: 'mr-1.5 h-3 w-3' });
											$.next(2);
											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								};

								$.if(node_9, ($$render) => {
									if (cartState.cart.email && !addressModule.editEmail && !userState.user?.userId) $$render(consequent_3);
								});
							}

							$.reset(div_10);

							var node_11 = $.sibling(div_10, 2);

							{
								var consequent_4 = ($$anchor) => {
									var div_11 = root_4();
									var div_12 = $.child(div_11);
									var p_1 = $.sibling($.child(div_12), 2);
									var text_2 = $.only_child(p_1, true);

									$.reset(div_12);

									var div_13 = $.sibling(div_12, 2);
									var p_2 = $.sibling($.child(div_13), 2);
									var text_3 = $.only_child(p_2, true);

									$.reset(div_13);
									$.reset(div_11);

									$.template_effect(() => {
										$.set_text(text_2, cartState.cart.email);
										$.set_text(text_3, cartState.cart.phone);
									});

									$.append($$anchor, div_11);
								};

								var consequent_9 = ($$anchor) => {
									var form = root_6();
									var div_14 = $.child(form);
									var label = $.child(div_14);
									var node_12 = $.sibling($.child(label));

									{
										var consequent_5 = ($$anchor) => {
											var span = root_5();

											$.append($$anchor, span);
										};

										$.if(node_12, ($$render) => {
											if (!addressModule.isEmailRequired) $$render(consequent_5);
										});
									}

									$.reset(label);

									var node_13 = $.sibling(label, 2);

									Textbox(node_13, {
										type: 'email',
										get required() {
											return addressModule.isEmailRequired;
										},
										class: 'w-full',
										get schema() {
											return schemas.email;
										},
										placeholder: 'your@email.com',
										get value() {
											return addressModule.email;
										},

										set value($$value) {
											addressModule.email = $$value;
										}
									});

									$.next(2);
									$.reset(div_14);

									var div_15 = $.sibling(div_14, 2);
									var label_1 = $.child(div_15);
									var node_14 = $.sibling($.child(label_1));

									{
										var consequent_6 = ($$anchor) => {
											var span_1 = root_5();

											$.append($$anchor, span_1);
										};

										$.if(node_14, ($$render) => {
											if (!addressModule.isPhoneRequired) $$render(consequent_6);
										});
									}

									$.reset(label_1);

									var node_15 = $.sibling(label_1, 2);

									Textbox(node_15, {
										type: 'tel',
										get required() {
											return addressModule.isPhoneRequired;
										},
										class: 'w-full',
										get schema() {
											return schemas.phone;
										},
										placeholder: 'XXXXXXXXXX',
										get value() {
											return addressModule.phone;
										},

										set value($$value) {
											addressModule.phone = $$value;
										}
									});

									$.next(2);
									$.reset(div_15);

									var div_16 = $.sibling(div_15, 2);
									var node_16 = $.child(div_16);

									{
										var consequent_7 = ($$anchor) => {
											Button($$anchor, {
												variant: 'outline',
												onclick: () => addressModule.editEmail = false,
												type: 'button',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Cancel');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										};

										$.if(node_16, ($$render) => {
											if (cartState.cart.email) $$render(consequent_7);
										});
									}

									var node_17 = $.sibling(node_16, 2);

									Button(node_17, {
										type: 'submit',
										get disabled() {
											return cartState.isUpdatingCart;
										},
										class: 'min-w-[120px]',
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = $.comment();
											var node_18 = $.first_child(fragment_6);

											{
												var consequent_8 = ($$anchor) => {
													LoadingDots($$anchor, {});
												};

												var alternate = ($$anchor) => {
													var text_5 = $.text('Save Contact');

													$.append($$anchor, text_5);
												};

												$.if(node_18, ($$render) => {
													if (cartState.isUpdatingCart) $$render(consequent_8); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});

									$.reset(div_16);
									$.reset(form);
									$.event('submit', form, saveContactInfo);
									$.append($$anchor, form);
								};

								$.if(node_11, ($$render) => {
									if ($.get(isEmailOk) && $.get(isPhoneOk) && !addressModule.editEmail) $$render(consequent_4); else if (!$.get(isEmailOk) || !$.get(isPhoneOk) || addressModule.editEmail) $$render(consequent_9, 1);
								});
							}

							$.reset(div_9);
							$.append($$anchor, div_9);
						};

						$.if(node_8, ($$render) => {
							if (addressModule.isPhoneRequired || addressModule.isEmailRequired) $$render(consequent_10);
						});
					}

					var node_19 = $.sibling(node_8, 2);

					{
						var consequent_25 = ($$anchor) => {
							var fragment_8 = root_19();
							var div_17 = $.first_child(fragment_8);
							var node_20 = $.child(div_17);

							{
								var consequent_11 = ($$anchor) => {
									var div_18 = root_8();
									var div_19 = $.child(div_18);
									var node_21 = $.sibling($.child(div_19), 2);

									Button(node_21, {
										variant: 'link',
										onclick: () => showAuthModal('login'),
										class: 'h-auto p-0',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Login to view your saved addresses');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									$.reset(div_19);

									var node_22 = $.sibling(div_19, 2);

									AddressForm(node_22, {
										get isLoading() {
											return $.get(loadingForGuestCheckout);
										},
										onsave: handleGuestSubmit,
										get address() {
											return addressModule.currentAddress;
										},

										set address($$value) {
											addressModule.currentAddress = $$value;
										}
									});

									$.reset(div_18);
									$.append($$anchor, div_18);
								};

								var consequent_15 = ($$anchor) => {
									var div_20 = root_12();
									var div_21 = $.child(div_20);
									var node_23 = $.sibling($.child(div_21), 2);

									{
										var consequent_12 = ($$anchor) => {
											Button($$anchor, {
												get onclick() {
													return addressModule.handleAddressChangeClick;
												},
												variant: 'ghost',
												class: 'h-8',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Change');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										};

										$.if(node_23, ($$render) => {
											if (!addressModule.loadingForSaveToCart) $$render(consequent_12);
										});
									}

									$.reset(div_21);

									var node_24 = $.sibling(div_21, 2);

									{
										var consequent_13 = ($$anchor) => {
											var div_22 = root_9();
											var node_25 = $.child(div_22);

											Skeleton(node_25, { class: 'h-[100px] w-full rounded-lg' });
											$.reset(div_22);
											$.append($$anchor, div_22);
										};

										var alternate_1 = ($$anchor) => {
											var div_23 = root_11();
											var div_24 = $.child(div_23);
											var node_26 = $.child(div_24);

											MapPin(node_26, { class: 'mr-2 h-4 w-4 text-primary' });

											var h3 = $.sibling(node_26, 2);
											var text_8 = $.only_child(h3);

											$.reset(div_24);

											var div_25 = $.sibling(div_24, 2);
											var p_3 = $.child(div_25);
											var text_9 = $.only_child(p_3, true);
											var node_27 = $.sibling(p_3, 2);

											{
												var consequent_14 = ($$anchor) => {
													var p_4 = root_10();
													var text_10 = $.only_child(p_4, true);

													$.template_effect(() => $.set_text(text_10, cartState.cart.shippingAddress?.address_2));
													$.append($$anchor, p_4);
												};

												$.if(node_27, ($$render) => {
													if (cartState.cart.shippingAddress?.address_2) $$render(consequent_14);
												});
											}

											var p_5 = $.sibling(node_27, 2);
											var text_11 = $.only_child(p_5);
											var p_6 = $.sibling(p_5, 2);
											var text_12 = $.only_child(p_6);
											var p_7 = $.sibling(p_6, 2);
											var text_13 = $.sibling($.child(p_7));

											$.reset(p_7);
											$.reset(div_25);
											$.reset(div_23);

											$.template_effect(() => {
												$.set_text(text_8, `${cartState.cart.shippingAddress?.firstName ?? ''}
														${cartState.cart.shippingAddress?.lastName ?? ''}`);

												$.set_text(text_9, cartState.cart.shippingAddress?.address_1);
												$.set_text(text_11, `${cartState.cart.shippingAddress?.city ?? ''}, ${cartState.cart.shippingAddress?.state ?? ''}`);

												$.set_text(text_12, `${cartState.cart.shippingAddress?.countryCode ?? ''}
														${cartState.cart.shippingAddress?.zip ?? ''}`);

												$.set_text(text_13, ` ${cartState.cart.shippingAddress?.phone ?? ''}`);
											});

											$.append($$anchor, div_23);
										};

										$.if(node_24, ($$render) => {
											if (addressModule.loadingForSaveToCart && addressModule.currentAddressType == 'shipping') $$render(consequent_13); else $$render(alternate_1, -1);
										});
									}

									$.reset(div_20);
									$.append($$anchor, div_20);
								};

								var alternate_3 = ($$anchor) => {
									var div_26 = root_14();
									var div_27 = $.child(div_26);
									var node_28 = $.sibling($.child(div_27), 2);

									{
										var consequent_16 = ($$anchor) => {
											Button($$anchor, {
												variant: 'link',
												onclick: () => showAuthModal('login'),
												class: 'h-auto p-0',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_14 = $.text('Login to view saved addresses');

													$.append($$anchor, text_14);
												},
												$$slots: { default: true }
											});
										};

										$.if(node_28, ($$render) => {
											if (!userState?.user?.role) $$render(consequent_16);
										});
									}

									$.reset(div_27);

									var form_1 = $.sibling(div_27, 2);
									var node_29 = $.child(form_1);

									{
										var consequent_17 = ($$anchor) => {
											Skeleton($$anchor, { class: 'h-[100px] w-full rounded-lg' });
										};

										var alternate_2 = ($$anchor) => {
											var div_28 = root_13();
											var node_30 = $.sibling($.child(div_28), 2);

											Button(node_30, {
												type: 'button',
												variant: 'default',
												class: 'px-8',
												get onclick() {
													return addressModule.handleAddNewAddress;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_15 = $.text('Add New Address');

													$.append($$anchor, text_15);
												},
												$$slots: { default: true }
											});

											$.reset(div_28);
											$.append($$anchor, div_28);
										};

										$.if(node_29, ($$render) => {
											if (addressModule.loadingForSaveToCart && addressModule.currentAddressType == 'shipping') $$render(consequent_17); else $$render(alternate_2, -1);
										});
									}

									$.reset(form_1);
									$.reset(div_26);
									$.append($$anchor, div_26);
								};

								$.if(node_20, ($$render) => {
									if ($.get(isGuestCheckout)) $$render(consequent_11); else if (cartState.cart.shippingAddress) $$render(consequent_15, 1); else $$render(alternate_3, -1);
								});
							}

							$.reset(div_17);

							var node_31 = $.sibling(div_17, 2);

							{
								var consequent_23 = ($$anchor) => {
									var div_29 = root_17();
									var div_30 = $.child(div_29);
									var div_31 = $.child(div_30);
									var node_32 = $.sibling($.child(div_31), 2);

									{
										var consequent_19 = ($$anchor) => {
											Button($$anchor, {
												get onclick() {
													return addressModule.handleBilingAddOrChangeClick;
												},
												variant: 'ghost',
												class: 'h-8',
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = $.comment();
													var node_33 = $.first_child(fragment_13);

													{
														var consequent_18 = ($$anchor) => {
															var text_16 = $.text('Change');

															$.append($$anchor, text_16);
														};

														var alternate_4 = ($$anchor) => {
															var text_17 = $.text('Add Address');

															$.append($$anchor, text_17);
														};

														$.if(node_33, ($$render) => {
															if (cartState.cart.billingAddress?.address_1) $$render(consequent_18); else $$render(alternate_4, -1);
														});
													}

													$.append($$anchor, fragment_13);
												},
												$$slots: { default: true }
											});
										};

										$.if(node_32, ($$render) => {
											if (!addressModule.loadingForSaveToCart) $$render(consequent_19);
										});
									}

									$.reset(div_31);

									var node_34 = $.sibling(div_31, 2);

									{
										var consequent_20 = ($$anchor) => {
											var div_32 = root_9();
											var node_35 = $.child(div_32);

											Skeleton(node_35, { class: 'h-[100px] w-full rounded-lg' });
											$.reset(div_32);
											$.append($$anchor, div_32);
										};

										var consequent_22 = ($$anchor) => {
											var div_33 = root_15();
											var div_34 = $.child(div_33);
											var node_36 = $.child(div_34);

											MapPin(node_36, { class: 'mr-2 h-4 w-4 text-primary' });

											var h3_1 = $.sibling(node_36, 2);
											var text_18 = $.only_child(h3_1);

											$.reset(div_34);

											var div_35 = $.sibling(div_34, 2);
											var p_8 = $.child(div_35);
											var text_19 = $.only_child(p_8, true);
											var node_37 = $.sibling(p_8, 2);

											{
												var consequent_21 = ($$anchor) => {
													var p_9 = root_10();
													var text_20 = $.only_child(p_9, true);

													$.template_effect(() => $.set_text(text_20, cartState.cart.billingAddress?.address_2));
													$.append($$anchor, p_9);
												};

												$.if(node_37, ($$render) => {
													if (cartState.cart.billingAddress?.address_2) $$render(consequent_21);
												});
											}

											var p_10 = $.sibling(node_37, 2);
											var text_21 = $.only_child(p_10);
											var p_11 = $.sibling(p_10, 2);
											var text_22 = $.only_child(p_11);
											var p_12 = $.sibling(p_11, 2);
											var text_23 = $.sibling($.child(p_12));

											$.reset(p_12);
											$.reset(div_35);
											$.reset(div_33);

											$.template_effect(() => {
												$.set_text(text_18, `${cartState.cart.billingAddress?.firstName ?? ''}
														${cartState.cart.billingAddress?.lastName ?? ''}`);

												$.set_text(text_19, cartState.cart.billingAddress?.address_1);
												$.set_text(text_21, `${cartState.cart.billingAddress?.city ?? ''}, ${cartState.cart.billingAddress?.state ?? ''}`);
												$.set_text(text_22, `${cartState.cart.billingAddress?.countryCode ?? ''} ${cartState.cart.billingAddress?.zip ?? ''}`);
												$.set_text(text_23, ` ${cartState.cart.billingAddress?.phone ?? ''}`);
											});

											$.append($$anchor, div_33);
										};

										var alternate_5 = ($$anchor) => {
											var div_36 = root_16();

											$.append($$anchor, div_36);
										};

										$.if(node_34, ($$render) => {
											if (addressModule.loadingForSaveToCart && addressModule.currentAddressType == 'billing') $$render(consequent_20); else if (cartState.cart?.billingAddress?.address_1) $$render(consequent_22, 1); else $$render(alternate_5, -1);
										});
									}

									$.reset(div_30);
									$.reset(div_29);
									$.append($$anchor, div_29);
								};

								$.if(node_31, ($$render) => {
									if (!addressModule.isBillingAddressSameAsShipping) $$render(consequent_23);
								});
							}

							var node_38 = $.sibling(node_31, 2);

							{
								var consequent_24 = ($$anchor) => {
									var div_37 = root_18();
									var node_39 = $.child(div_37);

									{
										let $0 = $.derived(() => addressModule?.handleBillingAddressSameCheck);

										Checkbox(node_39, {
											get checked() {
												return addressModule.isBillingAddressSameAsShipping;
											},

											get onCheckedChange() {
												return $.get($0);
											},
											id: 'isBillingAddressSameAsShipping'
										});
									}

									$.next(2);
									$.reset(div_37);
									$.append($$anchor, div_37);
								};

								$.if(node_38, ($$render) => {
									if (!$.get(isGuestCheckout)) $$render(consequent_24);
								});
							}

							$.append($$anchor, fragment_8);
						};

						$.if(node_19, ($$render) => {
							if ($.get(isEmailOk) && $.get(isPhoneOk)) $$render(consequent_25);
						});
					}

					$.reset(div_5);

					var div_38 = $.sibling(div_5, 2);
					var div_39 = $.child(div_38);
					var node_40 = $.sibling($.child(div_39), 2);

					{
						var consequent_26 = ($$anchor) => {
							var div_40 = root_20();
							var node_41 = $.child(div_40);

							LoadingDots(node_41, {});
							$.reset(div_40);
							$.append($$anchor, div_40);
						};

						var alternate_7 = ($$anchor) => {
							var div_41 = root_26();
							var div_42 = $.child(div_41);
							var div_43 = $.child(div_42);
							var span_2 = $.sibling($.child(div_43), 2);
							var text_24 = $.only_child(span_2, true);

							$.reset(div_43);

							var node_42 = $.sibling(div_43, 2);

							{
								var consequent_27 = ($$anchor) => {
									var div_44 = root_21();
									var span_3 = $.sibling($.child(div_44), 2);
									var text_25 = $.only_child(span_3);

									$.reset(div_44);

									$.template_effect(($0) => $.set_text(text_25, `- ${$0 ?? ''}`), [
										() => formatPrice(cartState.cart.discountAmount, page?.data?.store?.currency?.code)
									]);

									$.append($$anchor, div_44);
								};

								$.if(node_42, ($$render) => {
									if (cartState.cart.discountAmount > 0) $$render(consequent_27);
								});
							}

							var div_45 = $.sibling(node_42, 2);
							var div_46 = $.child(div_45);
							var node_43 = $.sibling($.child(div_46), 2);

							{
								var consequent_28 = ($$anchor) => {
									var span_4 = root_22();

									$.append($$anchor, span_4);
								};

								var consequent_29 = ($$anchor) => {
									var span_5 = root_23();
									var text_26 = $.only_child(span_5, true);

									$.template_effect(($0) => $.set_text(text_26, $0), [
										() => formatPrice(cartState.cart.shippingCharges, page?.data?.store?.currency?.code)
									]);

									$.append($$anchor, span_5);
								};

								var alternate_6 = ($$anchor) => {
									var span_6 = root_24();

									$.append($$anchor, span_6);
								};

								$.if(node_43, ($$render) => {
									if (!cartState.cart.shippingAddress) $$render(consequent_28); else if (cartState.cart.shippingCharges) $$render(consequent_29, 1); else $$render(alternate_6, -1);
								});
							}

							$.reset(div_46);
							$.reset(div_45);
							$.reset(div_42);

							var div_47 = $.sibling(div_42, 2);
							var span_7 = $.sibling($.child(div_47), 2);
							var text_27 = $.only_child(span_7, true);

							$.reset(div_47);

							var node_44 = $.sibling(div_47, 2);

							{
								var consequent_30 = ($$anchor) => {
									var div_48 = root_25();
									var text_28 = $.only_child(div_48, true);

									$.template_effect(() => $.set_text(text_28, addressModule.errorMessage));
									$.append($$anchor, div_48);
								};

								$.if(node_44, ($$render) => {
									if (addressModule.showError) $$render(consequent_30);
								});
							}

							var div_49 = $.sibling(node_44, 2);
							var node_45 = $.child(div_49);

							LockKeyhole(node_45, { class: 'h-3.5 w-3.5 text-gray-400' });
							$.next(2);
							$.reset(div_49);

							var node_46 = $.sibling(div_49, 2);

							{
								var consequent_31 = ($$anchor) => {
									{
										let $0 = $.derived(() => !($.get(isPhoneOk) && $.get(isEmailOk) && cartState.cart.shippingAddress && !addressModule.editAddress));

										CheckoutButton($$anchor, {
											text: 'Continue to Payment',
											disabledText: 'Select Address',
											get disabled() {
												return $.get($0);
											},

											get onclick() {
												return addressModule.handleProceedToPayment;
											},

											get loading() {
												return addressModule.loadingForCheckout;
											}
										});
									}
								};

								$.if(node_46, ($$render) => {
									if (!addressModule.showAddressList && !addressModule.showAddressForm) $$render(consequent_31);
								});
							}

							$.reset(div_41);

							$.template_effect(
								($0, $1) => {
									$.set_text(text_24, $0);
									$.set_text(text_27, $1);
								},
								[
									() => formatPrice(cartState.cart.subtotal, page?.data?.store?.currency?.code),
									() => formatPrice(cartState.cart.total, page?.data?.store?.currency?.code)
								]
							);

							$.append($$anchor, div_41);
						};

						$.if(node_40, ($$render) => {
							if (addressModule.loadingForCart) $$render(consequent_26); else $$render(alternate_7, -1);
						});
					}

					$.reset(div_39);

					var node_47 = $.sibling(div_39, 2);

					OrderTrustBadges(node_47, {});
					$.reset(div_38);
					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				$.if(node_2, ($$render) => {
					if (addressModule.noItemsChecked && cartState?.cart?.lineItems?.length > 0) $$render(consequent); else if (cartState?.cart?.lineItems?.length === 0 && !cartState?.isUpdatingCart) $$render(consequent_1, 1); else $$render(alternate_8, -1);
				});
			}

			$.append($$anchor, fragment_1);
		}
	);

	$.reset(div_1);
	$.reset(div);

	var node_49 = $.sibling(div, 2);

	AddressListModal(node_49, {
		get addresses() {
			return addressModule.addresses;
		},

		get paginateAddress() {
			return addressModule.paginateAddress;
		},

		get onaddnew() {
			return addressModule.handleAddNewAddressFromModal;
		},

		get onedit() {
			return addressModule.handleEditAddress;
		},

		get onselect() {
			return addressModule.handleSelectAddress;
		},
		ondelete: deleteAddress,
		get show() {
			return addressModule.showAddressList;
		},

		set show($$value) {
			addressModule.showAddressList = $$value;
		}
	});

	var node_50 = $.sibling(node_49, 2);

	AddressFormModal(node_50, {
		get isEdit() {
			return addressModule.isEditingAddress;
		},

		get onback() {
			return addressModule.handleFormBack;
		},

		get onclose() {
			return addressModule.handleFormClose;
		},

		get onsave() {
			return addressModule.handleFormSave;
		},
		ondelete: deleteAddress,
		get show() {
			return addressModule.showAddressForm;
		},

		set show($$value) {
			addressModule.showAddressForm = $$value;
		},

		get address() {
			return addressModule.currentAddress;
		},

		set address($$value) {
			addressModule.currentAddress = $$value;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);