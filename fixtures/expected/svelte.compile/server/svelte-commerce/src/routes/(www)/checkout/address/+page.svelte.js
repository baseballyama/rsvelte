import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let loadingForGuestCheckout = false;

		// Coming back from the payment step: prefill the guest form with the saved
		// address so it can be edited in place.
		onMount(async () => {
			await cartState.hasLoaded;

			if (isGuestCheckout()) {
				if (cartState.cart.shippingAddress) {
					addressModule.currentAddress = cartState.cart.shippingAddress;
					addressModule.currentAddressType = 'shipping';
					addressModule.isBillingAddressSameAsShipping = true;
				}
			}
		});

		async function handleGuestSubmit(address) {
			try {
				loadingForGuestCheckout = true;
				await cartState.updateEmail({ email: address.email, phone: address.phone });

				// saveAddressToCart (not handleFormSave) so the save is actually awaited.
				await addressModule.saveAddressToCart();

				if (!cartState.cart.shippingAddress) {
					// A stale auth session (connect.sid) makes the API stamp user_id=0 on the
					// address insert and 500. Guests don't need that session — drop it and retry.
					await authService.logout().catch(() => {});

					await addressModule.saveAddressToCart();
				}

				if (isPhoneOk() && isEmailOk() && cartState.cart.shippingAddress && !addressModule.editAddress) {
					await addressModule.handleProceedToPayment();
				}
			} finally {
				loadingForGuestCheckout = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('gashdp', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Address - ${$.escape(page?.data?.store?.name || '')}</title>`);
				});
			});

			$$renderer.push(`<div class="min-h-screen py-8"><div class="container mx-auto px-4">`);
			CheckoutHeader($$renderer, { step: 2 });
			$$renderer.push(`<!----> `);

			$.await(
				$$renderer,
				cartState.hasLoaded,
				() => {
					$$renderer.push(`<div class="flex min-h-96 items-center justify-center py-8">`);
					LoaderCircle($$renderer, { class: 'animate-spin' });
					$$renderer.push(`<!----></div>`);
				},
				() => {
					if (addressModule.noItemsChecked && cartState?.cart?.lineItems?.length > 0) {
						$$renderer.push(`<!--[0--><div class="flex h-96 flex-col items-center justify-center gap-3"><p class="text-xl text-gray-400">You must select at least one item in cart for checkout</p> `);

						Button($$renderer, {
							variant: 'outline',
							href: appendOneTimeCartId('/checkout/cart'),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Go back to cart`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					} else if (cartState?.cart?.lineItems?.length === 0 && !cartState?.isUpdatingCart) {
						$$renderer.push(`<!--[1--><div class="flex h-96 flex-col items-center justify-center gap-3"><p class="text-xl text-gray-400">Your cart is empty</p> `);

						Button($$renderer, {
							variant: 'outline',
							href: '/',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Continue Shopping`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="grid gap-8 lg:grid-cols-[1fr_400px]"><div class="space-y-6">`);

						$.await($$renderer, userState.hasLoaded, () => {}, (_) => {
							if (!userState.user?.userId) {
								$$renderer.push(`<!--[0--><div class="rounded-lg border border-blue-100 bg-blue-50 p-4"><div class="flex items-start gap-3">`);
								ShoppingBag($$renderer, { class: 'mt-0.5 size-5 shrink-0 text-blue-600' });
								$$renderer.push(`<!----> <div><p class="text-sm font-semibold text-blue-900">You're checking out as a guest</p> <p class="mt-1 text-sm text-blue-800">No account needed — just enter your details below. Optionally, <button class="font-bold underline hover:text-blue-900">log in</button> to use your saved addresses and speed up checkout.</p></div></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						});

						$$renderer.push(`<!--]--> `);

						if (addressModule.isPhoneRequired || addressModule.isEmailRequired) {
							$$renderer.push(`<!--[0--><div class="overflow-hidden rounded-lg border border-border bg-background shadow-sm"><div class="flex items-center justify-between border-b border-border px-5 py-4"><div class="flex items-center space-x-3"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Contact Details</h2></div> `);

							if (cartState.cart.email && !addressModule.editEmail && !userState.user?.userId) {
								$$renderer.push('<!--[0-->');

								Button($$renderer, {
									onclick: addressModule.handleEditEmail,
									variant: 'ghost',
									size: 'sm',
									class: 'h-8',
									children: ($$renderer) => {
										Pencil($$renderer, { class: 'mr-1.5 h-3 w-3' });
										$$renderer.push(`<!----> <span>Edit</span>`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> `);

							if (isEmailOk() && isPhoneOk() && !addressModule.editEmail) {
								$$renderer.push(`<!--[0--><div class="grid grid-cols-1 gap-6 p-6 transition-all duration-500 sm:grid-cols-2"><div class="flex flex-col gap-1"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Email Address</p> <p class="text-sm font-medium text-gray-900">${$.escape(cartState.cart.email)}</p></div> <div class="flex flex-col gap-1"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Phone Number</p> <p class="text-sm font-medium text-gray-900">${$.escape(cartState.cart.phone)}</p></div></div>`);
							} else if (!isEmailOk() || !isPhoneOk() || addressModule.editEmail) {
								$$renderer.push(`<!--[1--><form class="space-y-4 p-5 transition-all duration-500"><div class="space-y-1"><label for="email" class="block text-sm font-medium text-gray-700">Email address `);

								if (!addressModule.isEmailRequired) {
									$$renderer.push(`<!--[0--><span class="text-gray-400">(optional)</span>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></label> `);

								Textbox($$renderer, {
									type: 'email',
									required: addressModule.isEmailRequired,
									class: 'w-full',
									schema: schemas.email,
									placeholder: 'your@email.com',
									get value() {
										return addressModule.email;
									},

									set value($$value) {
										addressModule.email = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> <p class="mt-1 text-xs text-gray-500">We'll send order confirmation to this email</p></div> <div class="space-y-1"><label for="phone" class="block text-sm font-medium text-gray-700">Phone number `);

								if (!addressModule.isPhoneRequired) {
									$$renderer.push(`<!--[0--><span class="text-gray-400">(optional)</span>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></label> `);

								Textbox($$renderer, {
									type: 'tel',
									required: addressModule.isPhoneRequired,
									class: 'w-full',
									schema: schemas.phone,
									placeholder: 'XXXXXXXXXX',
									get value() {
										return addressModule.phone;
									},

									set value($$value) {
										addressModule.phone = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> <p class="mt-1 text-xs text-gray-500">For delivery updates</p></div> <div class="flex justify-end space-x-3 pt-2">`);

								if (cartState.cart.email) {
									$$renderer.push('<!--[0-->');

									Button($$renderer, {
										variant: 'outline',
										onclick: () => addressModule.editEmail = false,
										type: 'button',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Cancel`);
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								Button($$renderer, {
									type: 'submit',
									disabled: cartState.isUpdatingCart,
									class: 'min-w-[120px]',
									children: ($$renderer) => {
										if (cartState.isUpdatingCart) {
											$$renderer.push('<!--[0-->');
											LoadingDots($$renderer, {});
										} else {
											$$renderer.push(`<!--[-1-->Save Contact`);
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div></form>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (isEmailOk() && isPhoneOk()) {
							$$renderer.push(`<!--[0--><div class="overflow-hidden rounded-lg border border-border bg-background shadow-sm">`);

							if (isGuestCheckout()) {
								$$renderer.push(`<!--[0--><div class="p-6"><div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Delivery Address</h2> `);

								Button($$renderer, {
									variant: 'link',
									onclick: () => showAuthModal('login'),
									class: 'h-auto p-0',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Login to view your saved addresses`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div> `);

								AddressForm($$renderer, {
									isLoading: loadingForGuestCheckout,
									onsave: handleGuestSubmit,
									get address() {
										return addressModule.currentAddress;
									},

									set address($$value) {
										addressModule.currentAddress = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----></div>`);
							} else if (cartState.cart.shippingAddress) {
								$$renderer.push(`<!--[1--><div><div class="flex items-center justify-between border-b border-border px-5 py-4"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Delivery Address</h2> `);

								if (!addressModule.loadingForSaveToCart) {
									$$renderer.push('<!--[0-->');

									Button($$renderer, {
										onclick: addressModule.handleAddressChangeClick,
										variant: 'ghost',
										class: 'h-8',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Change`);
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div> `);

								if (addressModule.loadingForSaveToCart && addressModule.currentAddressType == 'shipping') {
									$$renderer.push(`<!--[0--><div class="p-6">`);
									Skeleton($$renderer, { class: 'h-[100px] w-full rounded-lg' });
									$$renderer.push(`<!----></div>`);
								} else {
									$$renderer.push(`<!--[-1--><div class="p-6 transition-all duration-500"><div class="mb-4 flex items-center">`);
									MapPin($$renderer, { class: 'mr-2 h-4 w-4 text-primary' });

									$$renderer.push(`<!----> <h3 class="text-sm font-bold uppercase tracking-tight text-gray-900">${$.escape(cartState.cart.shippingAddress?.firstName)}
														${$.escape(cartState.cart.shippingAddress?.lastName)}</h3></div> <div class="space-y-1 text-sm leading-relaxed text-gray-600"><p>${$.escape(cartState.cart.shippingAddress?.address_1)}</p> `);

									if (cartState.cart.shippingAddress?.address_2) {
										$$renderer.push(`<!--[0--><p>${$.escape(cartState.cart.shippingAddress?.address_2)}</p>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> <p>${$.escape(cartState.cart.shippingAddress?.city)}, ${$.escape(cartState.cart.shippingAddress?.state)}</p> <p>${$.escape(cartState.cart.shippingAddress?.countryCode)}
														${$.escape(cartState.cart.shippingAddress?.zip)}</p> <p class="mt-4 border-border pt-4 font-medium"><span class="mr-2 text-[10px] font-bold uppercase tracking-tighter text-gray-400">Phone</span> ${$.escape(cartState.cart.shippingAddress?.phone)}</p></div></div>`);
								}

								$$renderer.push(`<!--]--></div>`);
							} else {
								$$renderer.push(`<!--[-1--><div class="p-6"><div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><h2 class="text-base font-bold uppercase tracking-widest text-gray-900" style="font-family: var(--font-body);">Shipping Address</h2> `);

								if (!userState?.user?.role) {
									$$renderer.push('<!--[0-->');

									Button($$renderer, {
										variant: 'link',
										onclick: () => showAuthModal('login'),
										class: 'h-auto p-0',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Login to view saved addresses`);
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div> <form>`);

								if (addressModule.loadingForSaveToCart && addressModule.currentAddressType == 'shipping') {
									$$renderer.push('<!--[0-->');
									Skeleton($$renderer, { class: 'h-[100px] w-full rounded-lg' });
								} else {
									$$renderer.push(`<!--[-1--><div class="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 py-8 text-center transition-all duration-300 hover:bg-gray-100/50"><p class="mb-6 text-sm text-gray-500">No shipping address selected</p> `);

									Button($$renderer, {
										type: 'button',
										variant: 'default',
										class: 'px-8',
										onclick: addressModule.handleAddNewAddress,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Add New Address`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div>`);
								}

								$$renderer.push(`<!--]--></form></div>`);
							}

							$$renderer.push(`<!--]--></div> `);

							if (!addressModule.isBillingAddressSameAsShipping) {
								$$renderer.push(`<!--[0--><div class="overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-all duration-300"><div><div class="flex items-center justify-between border-b border-border px-5 py-4"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Billing Address</h2> `);

								if (!addressModule.loadingForSaveToCart) {
									$$renderer.push('<!--[0-->');

									Button($$renderer, {
										onclick: addressModule.handleBilingAddOrChangeClick,
										variant: 'ghost',
										class: 'h-8',
										children: ($$renderer) => {
											if (cartState.cart.billingAddress?.address_1) {
												$$renderer.push(`<!--[0-->Change`);
											} else {
												$$renderer.push(`<!--[-1-->Add Address`);
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div> `);

								if (addressModule.loadingForSaveToCart && addressModule.currentAddressType == 'billing') {
									$$renderer.push(`<!--[0--><div class="p-6">`);
									Skeleton($$renderer, { class: 'h-[100px] w-full rounded-lg' });
									$$renderer.push(`<!----></div>`);
								} else if (cartState.cart?.billingAddress?.address_1) {
									$$renderer.push(`<!--[1--><div class="p-6 transition-all duration-500"><div class="mb-4 flex items-center">`);
									MapPin($$renderer, { class: 'mr-2 h-4 w-4 text-primary' });

									$$renderer.push(`<!----> <h3 class="text-sm font-bold uppercase tracking-tight text-gray-900">${$.escape(cartState.cart.billingAddress?.firstName)}
														${$.escape(cartState.cart.billingAddress?.lastName)}</h3></div> <div class="space-y-1 text-sm leading-relaxed text-gray-600"><p>${$.escape(cartState.cart.billingAddress?.address_1)}</p> `);

									if (cartState.cart.billingAddress?.address_2) {
										$$renderer.push(`<!--[0--><p>${$.escape(cartState.cart.billingAddress?.address_2)}</p>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> <p>${$.escape(cartState.cart.billingAddress?.city)}, ${$.escape(cartState.cart.billingAddress?.state)}</p> <p>${$.escape(cartState.cart.billingAddress?.countryCode)} ${$.escape(cartState.cart.billingAddress?.zip)}</p> <p class="mt-4 border-t border-gray-50 pt-4 font-medium"><span class="mr-2 text-[10px] font-bold uppercase tracking-tighter text-gray-400">Phone</span> ${$.escape(cartState.cart.billingAddress?.phone)}</p></div></div>`);
								} else {
									$$renderer.push(`<!--[-1--><div class="bg-gray-50 p-8 text-center transition-all duration-500"><p class="text-sm text-gray-500">No billing address saved.</p></div>`);
								}

								$$renderer.push(`<!--]--></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (!isGuestCheckout()) {
								$$renderer.push(`<!--[0--><div class="flex items-center justify-start gap-2 p-4 transition-all hover:bg-gray-100">`);

								Checkbox($$renderer, {
									checked: addressModule.isBillingAddressSameAsShipping,
									onCheckedChange: addressModule?.handleBillingAddressSameCheck,
									id: 'isBillingAddressSameAsShipping'
								});

								$$renderer.push(`<!----> <label for="isBillingAddressSameAsShipping" class="cursor-pointer text-xs font-bold uppercase tracking-tight text-gray-700">Billing address same as shipping</label></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="space-y-4"><div class="space-y-4 rounded-lg border border-border bg-background p-6 shadow-sm"><div class="mb-6 flex flex-col gap-1"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Price Summary</h2> <div class="h-1 w-12 bg-primary"></div></div> `);

						if (addressModule.loadingForCart) {
							$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-8">`);
							LoadingDots($$renderer, {});
							$$renderer.push(`<!----></div>`);
						} else {
							$$renderer.push(`<!--[-1--><div class="space-y-4"><div class="space-y-3 border-b border-border pb-6"><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Subtotal</span> <span class="font-bold text-gray-900">${$.escape(formatPrice(cartState.cart.subtotal, page?.data?.store?.currency?.code))}</span></div> `);

							if (cartState.cart.discountAmount > 0) {
								$$renderer.push(`<!--[0--><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Discount</span> <span class="font-bold uppercase tracking-tight text-orange-600">- ${$.escape(formatPrice(cartState.cart.discountAmount, page?.data?.store?.currency?.code))}</span></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <div class="flex flex-col gap-1"><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Shipping</span> `);

							if (!cartState.cart.shippingAddress) {
								$$renderer.push(`<!--[0--><span class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Address required</span>`);
							} else if (cartState.cart.shippingCharges) {
								$$renderer.push(`<!--[1--><span class="font-bold text-gray-900">${$.escape(formatPrice(cartState.cart.shippingCharges, page?.data?.store?.currency?.code))}</span>`);
							} else {
								$$renderer.push(`<!--[-1--><span class="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-600 ring-1 ring-green-100">FREE</span>`);
							}

							$$renderer.push(`<!--]--></div></div></div> <div class="flex items-center justify-between pt-2"><span class="text-sm font-bold uppercase text-gray-900">Total</span> <span class="text-xl font-bold text-gray-900">${$.escape(formatPrice(cartState.cart.total, page?.data?.store?.currency?.code))}</span></div> `);

							if (addressModule.showError) {
								$$renderer.push(`<!--[0--><div class="mt-4 rounded bg-red-50 p-3 text-[11px] font-bold uppercase tracking-tight text-red-600 ring-1 ring-red-100">${$.escape(addressModule.errorMessage)}</div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <div class="mt-6 flex items-center justify-center gap-2 rounded-md border border-gray-100 bg-gray-50/50 px-4 py-3 transition-all hover:bg-gray-100/80">`);
							LockKeyhole($$renderer, { class: 'h-3.5 w-3.5 text-gray-400' });
							$$renderer.push(`<!----> <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure 256-bit encryption</p></div> `);

							if (!addressModule.showAddressList && !addressModule.showAddressForm) {
								$$renderer.push('<!--[0-->');

								CheckoutButton($$renderer, {
									text: 'Continue to Payment',
									disabledText: 'Select Address',
									disabled: !(isPhoneOk() && isEmailOk() && cartState.cart.shippingAddress && !addressModule.editAddress),
									onclick: addressModule.handleProceedToPayment,
									loading: addressModule.loadingForCheckout
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						}

						$$renderer.push(`<!--]--></div> `);
						OrderTrustBadges($$renderer, {});
						$$renderer.push(`<!----></div></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}
			);

			$$renderer.push(`<!--]--></div></div> `);

			AddressListModal($$renderer, {
				addresses: addressModule.addresses,
				paginateAddress: addressModule.paginateAddress,
				onaddnew: addressModule.handleAddNewAddressFromModal,
				onedit: addressModule.handleEditAddress,
				onselect: addressModule.handleSelectAddress,
				ondelete: deleteAddress,
				get show() {
					return addressModule.showAddressList;
				},

				set show($$value) {
					addressModule.showAddressList = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			AddressFormModal($$renderer, {
				isEdit: addressModule.isEditingAddress,
				onback: addressModule.handleFormBack,
				onclose: addressModule.handleFormClose,
				onsave: addressModule.handleFormSave,
				ondelete: deleteAddress,
				get show() {
					return addressModule.showAddressForm;
				},

				set show($$value) {
					addressModule.showAddressForm = $$value;
					$$settled = false;
				},

				get address() {
					return addressModule.currentAddress;
				},

				set address($$value) {
					addressModule.currentAddress = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}