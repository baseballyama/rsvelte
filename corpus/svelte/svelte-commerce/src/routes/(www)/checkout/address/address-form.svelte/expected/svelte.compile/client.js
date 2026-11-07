import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { Save } from '@lucide/svelte';
import Textbox from '$lib/components/form/textbox.svelte';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';
import { page } from '$app/state';
import { AddressSchema } from '$lib/core/components/index.js';
import { AddressFormRenderer, checkoutAddressSchema } from '$lib/core/composables/index.js';

var root = $.from_html(`<!> Save Address`, 1);
var root_1 = $.from_html(`<form class="grid"><div class="grid grid-cols-2 gap-2"><!> <!></div> <div class="grid grid-cols-2 gap-2"><!> <!></div> <!> <!> <div class="grid grid-cols-2 gap-2"><!> <!> <div class="flex flex-col justify-center"><span class="text-xs uppercase tracking-wide text-gray-500">Country</span> <span class="text-sm font-medium text-gray-900"> </span></div> <!></div> <br/> <div class="flex flex-col gap-2"><!></div></form>`);

export default function Address_form($$anchor, $$props) {
	$.push($$props, true);

	let address = $.prop($$props, 'address', 15),
		isLoading = $.prop($$props, 'isLoading', 3, false);

	let show = $.state(true);
	const countryCode = $.derived(() => address()?.countryCode || page?.data?.store?.country?.code || '');
	const countryName = $.derived(() => page?.data?.store?.countries?.find((c) => c.code === $.get(countryCode))?.name || $.get(countryCode));

	// The country is display-only, so make sure the saved address still carries a code.
	$.user_effect(() => {
		if (address() && !address().countryCode && page?.data?.store?.country?.code) {
			address(address().countryCode = page.data.store.country.code, true);
		}
	});

	{
		const content = ($$anchor, $$arg0) => {
			let handleSubmit = () => ($$arg0?.()).handleSubmit;
			var form = root_1();
			var div = $.child(form);
			var node = $.child(div);

			Textbox(node, {
				name: 'firstName',
				autocomplete: 'given-name',
				placeholder: 'First Name',
				get schema() {
					return AddressSchema.firstName;
				},
				label: 'First Name',
				required: true,
				get value() {
					return address().firstName;
				},

				set value($$value) {
					address(address().firstName = $$value, true);
				}
			});

			var node_1 = $.sibling(node, 2);

			Textbox(node_1, {
				name: 'lastName',
				autocomplete: 'family-name',
				placeholder: 'Last Name',
				get schema() {
					return AddressSchema.lastName;
				},
				label: 'Last Name',
				required: true,
				get value() {
					return address().lastName;
				},

				set value($$value) {
					address(address().lastName = $$value, true);
				}
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_2 = $.child(div_1);

			Textbox(node_2, {
				name: 'email',
				type: 'email',
				autocomplete: 'email',
				placeholder: 'your@email.com',
				get schema() {
					return checkoutAddressSchema.email;
				},
				label: 'Email',
				required: true,
				get value() {
					return address().email;
				},

				set value($$value) {
					address(address().email = $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Textbox(node_3, {
				name: 'phone',
				type: 'tel',
				autocomplete: 'tel',
				placeholder: '+1234567890',
				get schema() {
					return AddressSchema.phone;
				},
				label: 'Phone',
				required: true,
				get value() {
					return address().phone;
				},

				set value($$value) {
					address(address().phone = $$value, true);
				}
			});

			$.reset(div_1);

			var node_4 = $.sibling(div_1, 2);

			Textbox(node_4, {
				name: 'address_1',
				autocomplete: 'address-line1',
				placeholder: 'Street Address',
				get schema() {
					return AddressSchema.address_1;
				},
				label: 'Address Line 1',
				required: true,
				get value() {
					return address().address_1;
				},

				set value($$value) {
					address(address().address_1 = $$value, true);
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Textbox(node_5, {
				name: 'address_2',
				autocomplete: 'address-line2',
				placeholder: 'Apartment, suite, etc.',
				label: 'Address Line 2',
				get value() {
					return address().address_2;
				},

				set value($$value) {
					address(address().address_2 = $$value, true);
				}
			});

			var div_2 = $.sibling(node_5, 2);
			var node_6 = $.child(div_2);

			Textbox(node_6, {
				name: 'city',
				autocomplete: 'address-level2',
				placeholder: 'City',
				get schema() {
					return AddressSchema.city;
				},
				label: 'City',
				required: true,
				get value() {
					return address().city;
				},

				set value($$value) {
					address(address().city = $$value, true);
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Textbox(node_7, {
				name: 'state',
				autocomplete: 'address-level1',
				placeholder: 'State',
				get schema() {
					return AddressSchema.state;
				},
				label: 'State',
				required: true,
				get value() {
					return address().state;
				},

				set value($$value) {
					address(address().state = $$value, true);
				}
			});

			var div_3 = $.sibling(node_7, 2);
			var span = $.sibling($.child(div_3), 2);
			var text = $.only_child(span, true);

			$.reset(div_3);

			var node_8 = $.sibling(div_3, 2);

			Textbox(node_8, {
				name: 'zip',
				autocomplete: 'postal-code',
				placeholder: '12345',
				get schema() {
					return AddressSchema.zip;
				},
				label: 'ZIP Code',
				required: true,
				get value() {
					return address().zip;
				},

				set value($$value) {
					address(address().zip = $$value, true);
				}
			});

			$.reset(div_2);

			var div_4 = $.sibling(div_2, 4);
			var node_9 = $.child(div_4);

			Button(node_9, {
				type: 'submit',
				get disabled() {
					return isLoading();
				},
				class: 'w-full',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_10 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							LoadingDots($$anchor, {});
						};

						var alternate = ($$anchor) => {
							var fragment_3 = root();
							var node_11 = $.first_child(fragment_3);

							Save(node_11, { class: 'mr-2 h-4 w-4' });
							$.next();
							$.append($$anchor, fragment_3);
						};

						$.if(node_10, ($$render) => {
							if (isLoading()) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);
			$.reset(form);
			$.template_effect(() => $.set_text(text, $.get(countryName)));

			$.event('submit', form, function (...$$args) {
				handleSubmit()?.apply(this, $$args);
			});

			$.append($$anchor, form);
		};

		AddressFormRenderer($$anchor, {
			get onsave() {
				return $$props.onsave;
			},

			get address() {
				return address();
			},

			set address($$value) {
				address($$value);
			},

			get show() {
				return $.get(show);
			},

			set show($$value) {
				$.set(show, $$value, true);
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}