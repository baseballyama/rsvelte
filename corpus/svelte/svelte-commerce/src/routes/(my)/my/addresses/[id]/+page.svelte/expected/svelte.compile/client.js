import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import Input from '$lib/components/ui/input/input.svelte';
import { addressService } from '$lib/core/services';
import { InfoIcon, Loader } from '@lucide/svelte';
import { toast } from '@misiki/kitcommerce-core';
import { browser } from '$app/environment';
import { Button } from '$lib/components/ui/button';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<div class="flex min-h-screen items-center justify-center"><div class="w-full max-w-4xl transform space-y-6 rounded-xl bg-white p-8 shadow-2xl transition-all dark:bg-gray-800"><div class="space-y-2 text-center"></div> <form class="w-full space-y-4"><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Address:</h2> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><div><label for="firstName" class="text-gray-700 dark:text-gray-300">First Name:</label> <!></div> <div><label for="lastName" class="text-gray-700 dark:text-gray-300">Last Name:</label> <!></div> <div><label for="address1" class="text-gray-700 dark:text-gray-300">Address 1:</label> <!></div> <div><label for="address2" class="text-gray-700 dark:text-gray-300">Address 2:</label> <!></div> <div><label for="city" class="text-gray-700 dark:text-gray-300">City:</label> <!></div> <div><label for="state" class="text-gray-700 dark:text-gray-300">State/Province:</label> <!></div> <div><label for="zip" class="text-gray-700 dark:text-gray-300">Zip/Postal Code:</label> <!></div> <div><label for="country" class="text-gray-700 dark:text-gray-300">Country:</label>  <select id="country" class="mt-1 block h-10 w-full rounded-md bg-background px-3 py-2 shadow-sm focus:outline-none sm:text-sm"></select></div></div> <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Contact Details:</h2> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><div><label for="phone" class="text-gray-700 dark:text-gray-300">Business phone:</label> <!></div> <div><label for="email" class="text-gray-700 dark:text-gray-300">Business email:</label> <!></div></div> <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Location Details:</h2> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><div><label for="lat" class="text-gray-700 dark:text-gray-300">Latitude:</label> <!></div> <div><label for="lng" class="text-gray-700 dark:text-gray-300">Longitude:</label> <!></div></div> <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Additional Details:</h2> <div class="grid grid-cols-1 gap-4 md:grid-cols-3"><div><label for="isPrimary" class="text-gray-700 dark:text-gray-300">Is Default Location:</label> <input id="isPrimary" type="checkbox" name="isPrimary" placeholder="Is Deafult Location" required="" class="mt-1 block h-[20px] w-[20px] rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm"/></div> <div><label for="isResiddential" class="text-gray-700 dark:text-gray-300">Is Resident:</label> <input id="isResiddential" type="checkbox" name="isResiddential" placeholder="Is Resident:" required="" class="mt-1 block h-[20px] w-[20px] rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm"/></div> <div class="md:col-span-3"><label for="deliveryInstructions" class="text-gray-700 dark:text-gray-300">Delivery Instructions:</label> <textarea id="deliveryInstructions" name="deliveryInstructions" placeholder="Instructions for Delivery" required="" class="mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm"></textarea></div> <div><label for="locality" class="text-gray-700 dark:text-gray-300">Locality:</label> <!></div></div></form></div></div> <div class="ease-[cubic-bezier(1,.32,.52,.67)] fixed left-0 right-0 top-10 z-50 mx-auto flex w-1/2 max-w-[1000px] flex-row justify-between rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs font-semibold text-black shadow transition-all duration-150 hover:bg-gray-100"><div class="flex flex-row items-center gap-2"><!> <span>Unsaved changes</span></div> <!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let address = $.state($.proxy({}));

	const countries = [
		{ name: 'India', value: 'ind' },
		{ name: 'United Kingdoms', value: 'uk' },
		{ name: 'Unigted States of America', value: 'usa' }
	];

	let detailsChanged = $.state(false);
	let isLoading = false;

	const saveAddress = async () => {
		try {
			const id = page.params.id;

			if (id == 'new') {
				$.set(address, await addressService.saveAddress($.get(address)), true);

				return;
			}

			if (!id) return;

			$.set(address, await addressService.editAddress(id, $.get(address)), true);
		} catch(e) {
			toast.error(e.message);
		} finally {
			$.set(detailsChanged, false);
		}
	};

	const handleDetailsChange = () => {
		$.set(detailsChanged, true);
	};

	const mount = async () => {
		if (browser) {
			document.onkeydown = function (e) {
				e = e || window.event;

				if (e.ctrlKey || e.metaKey) {
					// Check for both Ctrl and Command key
					var c = e.which || e.keyCode; // Get key code

					switch (c) {
						case 83:
							// Block Ctrl/Cmd + S
							e.preventDefault();
							e.stopPropagation();
							saveAddress();
							break;
					}
				}
			};
		}

		try {
			const id = page.params.id;

			if (!id || id == 'new') return;

			let res = await addressService.fetchAddress(id);

			$.set(address, res, true);
		} catch(e) {}
	};

	$.user_effect(() => {
		mount();
	});

	var fragment = root_1();

	// onMount()
	$.head('99ih5s', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Address Page';
		});
	});

	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var form = $.sibling($.child(div_1), 2);
	var div_2 = $.sibling($.child(form), 2);
	var div_3 = $.child(div_2);
	var node = $.sibling($.child(div_3), 2);

	Input(node, {
		id: 'firstName',
		name: 'firstName',
		placeholder: 'Enter First Name',
		class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
		get value() {
			return $.get(address).firstName;
		},

		set value($$value) {
			$.get(address).firstName = $$value;
		}
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.sibling($.child(div_4), 2);

	Input(node_1, {
		id: 'lastName',
		name: 'lastName',
		placeholder: 'Enter Last Name',
		class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
		get value() {
			return $.get(address).lastName;
		},

		set value($$value) {
			$.get(address).lastName = $$value;
		}
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.sibling($.child(div_5), 2);

	Input(node_2, {
		id: 'address1',
		name: 'address1',
		placeholder: 'Enter Address 1',
		class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
		get value() {
			return $.get(address).address_1;
		},

		set value($$value) {
			$.get(address).address_1 = $$value;
		}
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_3 = $.sibling($.child(div_6), 2);

	Input(node_3, {
		id: 'address2',
		name: 'address2',
		placeholder: 'Enter Address 2',
		class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
		get value() {
			return $.get(address).address_2;
		},

		set value($$value) {
			$.get(address).address_2 = $$value;
		}
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_4 = $.sibling($.child(div_7), 2);

	Input(node_4, {
		id: 'city',
		name: 'city',
		placeholder: 'Enter City',
		class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
		get value() {
			return $.get(address).city;
		},

		set value($$value) {
			$.get(address).city = $$value;
		}
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_5 = $.sibling($.child(div_8), 2);

	Input(node_5, {
		id: 'state',
		name: 'state',
		placeholder: 'Enter State/Province',
		class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
		get value() {
			return $.get(address).state;
		},

		set value($$value) {
			$.get(address).state = $$value;
		}
	});

	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_6 = $.sibling($.child(div_9), 2);

	Input(node_6, {
		id: 'zip',
		name: 'zip',
		placeholder: 'Enter Zip/Postal Code',
		class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
		get value() {
			return $.get(address).zip;
		},

		set value($$value) {
			$.get(address).zip = $$value;
		}
	});

	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var select = $.sibling($.child(div_10), 2);

	$.each(select, 21, () => countries, $.index, ($$anchor, country) => {
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(country).name);

			if (option_value !== (option_value = $.get(country).value)) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.reset(div_10);
	$.reset(div_2);

	var div_11 = $.sibling(div_2, 4);
	var div_12 = $.child(div_11);
	var node_7 = $.sibling($.child(div_12), 2);

	Input(node_7, {
		id: 'phone',
		type: 'phone',
		name: 'phone',
		placeholder: 'Enter Business Phone',
		required: true,
		class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
		get value() {
			return $.get(address).phone;
		},

		set value($$value) {
			$.get(address).phone = $$value;
		}
	});

	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var node_8 = $.sibling($.child(div_13), 2);

	Input(node_8, {
		id: 'email',
		type: 'email',
		name: 'email',
		placeholder: 'Enter Business Email',
		required: true,
		class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
		get value() {
			return $.get(address).email;
		},

		set value($$value) {
			$.get(address).email = $$value;
		}
	});

	$.reset(div_13);
	$.reset(div_11);

	var div_14 = $.sibling(div_11, 4);
	var div_15 = $.child(div_14);
	var node_9 = $.sibling($.child(div_15), 2);

	Input(node_9, {
		id: 'lat',
		type: 'number',
		name: 'lat',
		placeholder: 'Enter Latitude',
		required: true,
		class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
		get value() {
			return $.get(address).lat;
		},

		set value($$value) {
			$.get(address).lat = $$value;
		}
	});

	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var node_10 = $.sibling($.child(div_16), 2);

	Input(node_10, {
		id: 'lng',
		type: 'number',
		name: 'lng',
		placeholder: 'Enter Longitude',
		required: true,
		class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
		get value() {
			return $.get(address).lng;
		},

		set value($$value) {
			$.get(address).lng = $$value;
		}
	});

	$.reset(div_16);
	$.reset(div_14);

	var div_17 = $.sibling(div_14, 4);
	var div_18 = $.child(div_17);
	var input = $.sibling($.child(div_18), 2);

	$.remove_input_defaults(input);
	$.reset(div_18);

	var div_19 = $.sibling(div_18, 2);
	var input_1 = $.sibling($.child(div_19), 2);

	$.remove_input_defaults(input_1);
	$.reset(div_19);

	var div_20 = $.sibling(div_19, 2);
	var textarea = $.sibling($.child(div_20), 2);

	$.remove_textarea_child(textarea);
	$.reset(div_20);

	var div_21 = $.sibling(div_20, 2);
	var node_11 = $.sibling($.child(div_21), 2);

	Input(node_11, {
		id: 'locality',
		name: 'locality',
		placeholder: 'Enter Locality',
		required: true,
		class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
		get value() {
			return $.get(address).locality;
		},

		set value($$value) {
			$.get(address).locality = $$value;
		}
	});

	$.reset(div_21);
	$.reset(div_17);
	$.reset(form);
	$.reset(div_1);
	$.reset(div);

	var div_22 = $.sibling(div, 2);
	var div_23 = $.child(div_22);
	var node_12 = $.child(div_23);

	InfoIcon(node_12, { class: 'h-4 w-4' });
	$.next(2);
	$.reset(div_23);

	var node_13 = $.sibling(div_23, 2);

	Button(node_13, {
		onclick: saveAddress,
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_14 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
				};

				var alternate = ($$anchor) => {
					var text_1 = $.text('Save');

					$.append($$anchor, text_1);
				};

				$.if(node_14, ($$render) => {
					if (isLoading) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_22);
	$.template_effect(() => $.set_style(div_22, $.get(detailsChanged) ? 'display: flex' : 'display: none'));
	$.event('submit', form, saveAddress);
	$.delegated('input', form, handleDetailsChange);
	$.bind_select_value(select, () => $.get(address).country, ($$value) => $.get(address).country = $$value);
	$.bind_checked(input, () => $.get(address).isPrimary, ($$value) => $.get(address).isPrimary = $$value);
	$.bind_checked(input_1, () => $.get(address).isResiddential, ($$value) => $.get(address).isResiddential = $$value);
	$.bind_value(textarea, () => $.get(address).deliveryInstructions, ($$value) => $.get(address).deliveryInstructions = $$value);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['input']);