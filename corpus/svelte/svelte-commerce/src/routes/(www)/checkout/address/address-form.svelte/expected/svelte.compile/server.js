import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { Save } from '@lucide/svelte';
import Textbox from '$lib/components/form/textbox.svelte';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';
import { page } from '$app/state';
import { AddressSchema } from '$lib/core/components/index.js';
import { AddressFormRenderer, checkoutAddressSchema } from '$lib/core/composables/index.js';

export default function Address_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { address = void 0, isLoading = false, onsave } = $$props;
		let show = true;
		const countryCode = $.derived(() => address?.countryCode || page?.data?.store?.country?.code || '');
		const countryName = $.derived(() => page?.data?.store?.countries?.find((c) => c.code === countryCode())?.name || countryCode());
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function content($$renderer, { handleSubmit }) {
					$$renderer.push(`<form class="grid"><div class="grid grid-cols-2 gap-2">`);

					Textbox($$renderer, {
						name: 'firstName',
						autocomplete: 'given-name',
						placeholder: 'First Name',
						schema: AddressSchema.firstName,
						label: 'First Name',
						required: true,
						get value() {
							return address.firstName;
						},

						set value($$value) {
							address.firstName = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Textbox($$renderer, {
						name: 'lastName',
						autocomplete: 'family-name',
						placeholder: 'Last Name',
						schema: AddressSchema.lastName,
						label: 'Last Name',
						required: true,
						get value() {
							return address.lastName;
						},

						set value($$value) {
							address.lastName = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="grid grid-cols-2 gap-2">`);

					Textbox($$renderer, {
						name: 'email',
						type: 'email',
						autocomplete: 'email',
						placeholder: 'your@email.com',
						schema: checkoutAddressSchema.email,
						label: 'Email',
						required: true,
						get value() {
							return address.email;
						},

						set value($$value) {
							address.email = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Textbox($$renderer, {
						name: 'phone',
						type: 'tel',
						autocomplete: 'tel',
						placeholder: '+1234567890',
						schema: AddressSchema.phone,
						label: 'Phone',
						required: true,
						get value() {
							return address.phone;
						},

						set value($$value) {
							address.phone = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> `);

					Textbox($$renderer, {
						name: 'address_1',
						autocomplete: 'address-line1',
						placeholder: 'Street Address',
						schema: AddressSchema.address_1,
						label: 'Address Line 1',
						required: true,
						get value() {
							return address.address_1;
						},

						set value($$value) {
							address.address_1 = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Textbox($$renderer, {
						name: 'address_2',
						autocomplete: 'address-line2',
						placeholder: 'Apartment, suite, etc.',
						label: 'Address Line 2',
						get value() {
							return address.address_2;
						},

						set value($$value) {
							address.address_2 = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <div class="grid grid-cols-2 gap-2">`);

					Textbox($$renderer, {
						name: 'city',
						autocomplete: 'address-level2',
						placeholder: 'City',
						schema: AddressSchema.city,
						label: 'City',
						required: true,
						get value() {
							return address.city;
						},

						set value($$value) {
							address.city = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Textbox($$renderer, {
						name: 'state',
						autocomplete: 'address-level1',
						placeholder: 'State',
						schema: AddressSchema.state,
						label: 'State',
						required: true,
						get value() {
							return address.state;
						},

						set value($$value) {
							address.state = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <div class="flex flex-col justify-center"><span class="text-xs uppercase tracking-wide text-gray-500">Country</span> <span class="text-sm font-medium text-gray-900">${$.escape(countryName())}</span></div> `);

					Textbox($$renderer, {
						name: 'zip',
						autocomplete: 'postal-code',
						placeholder: '12345',
						schema: AddressSchema.zip,
						label: 'ZIP Code',
						required: true,
						get value() {
							return address.zip;
						},

						set value($$value) {
							address.zip = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <br/> <div class="flex flex-col gap-2">`);

					Button($$renderer, {
						type: 'submit',
						disabled: isLoading,
						class: 'w-full',
						children: ($$renderer) => {
							if (isLoading) {
								$$renderer.push('<!--[0-->');
								LoadingDots($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
								Save($$renderer, { class: 'mr-2 h-4 w-4' });
								$$renderer.push(`<!----> Save Address`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></form>`);
				}

				AddressFormRenderer($$renderer, {
					onsave,
					get address() {
						return address;
					},

					set address($$value) {
						address = $$value;
						$$settled = false;
					},

					get show() {
						return show;
					},

					set show($$value) {
						show = $$value;
						$$settled = false;
					},
					content,
					$$slots: { content: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { address });
	});
}