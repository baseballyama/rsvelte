import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import Input from '$lib/components/ui/input/input.svelte';
import { addressService } from '$lib/core/services';
import { InfoIcon, Loader } from '@lucide/svelte';
import { toast } from '@misiki/kitcommerce-core';
import { browser } from '$app/environment';
import { Button } from '$lib/components/ui/button';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let address = {};

		const countries = [
			{ name: 'India', value: 'ind' },
			{ name: 'United Kingdoms', value: 'uk' },
			{ name: 'Unigted States of America', value: 'usa' }
		];

		let detailsChanged = false;
		let isLoading = false;

		const saveAddress = async () => {
			try {
				const id = page.params.id;

				if (id == 'new') {
					address = await addressService.saveAddress(address);

					return;
				}

				if (!id) return;

				address = await addressService.editAddress(id, address);
			} catch(e) {
				toast.error(e.message);
			} finally {
				detailsChanged = false;
			}
		};

		const handleDetailsChange = () => {
			detailsChanged = true;
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

				address = res;
			} catch(e) {}
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('99ih5s', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Address Page</title>`);
				});
			});

			$$renderer.push(`<div class="flex min-h-screen items-center justify-center"><div class="w-full max-w-4xl transform space-y-6 rounded-xl bg-white p-8 shadow-2xl transition-all dark:bg-gray-800"><div class="space-y-2 text-center"></div> <form class="w-full space-y-4"><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Address:</h2> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><div><label for="firstName" class="text-gray-700 dark:text-gray-300">First Name:</label> `);

			Input($$renderer, {
				id: 'firstName',
				name: 'firstName',
				placeholder: 'Enter First Name',
				class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
				get value() {
					return address.firstName;
				},

				set value($$value) {
					address.firstName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div><label for="lastName" class="text-gray-700 dark:text-gray-300">Last Name:</label> `);

			Input($$renderer, {
				id: 'lastName',
				name: 'lastName',
				placeholder: 'Enter Last Name',
				class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
				get value() {
					return address.lastName;
				},

				set value($$value) {
					address.lastName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div><label for="address1" class="text-gray-700 dark:text-gray-300">Address 1:</label> `);

			Input($$renderer, {
				id: 'address1',
				name: 'address1',
				placeholder: 'Enter Address 1',
				class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
				get value() {
					return address.address_1;
				},

				set value($$value) {
					address.address_1 = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div><label for="address2" class="text-gray-700 dark:text-gray-300">Address 2:</label> `);

			Input($$renderer, {
				id: 'address2',
				name: 'address2',
				placeholder: 'Enter Address 2',
				class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
				get value() {
					return address.address_2;
				},

				set value($$value) {
					address.address_2 = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div><label for="city" class="text-gray-700 dark:text-gray-300">City:</label> `);

			Input($$renderer, {
				id: 'city',
				name: 'city',
				placeholder: 'Enter City',
				class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
				get value() {
					return address.city;
				},

				set value($$value) {
					address.city = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div><label for="state" class="text-gray-700 dark:text-gray-300">State/Province:</label> `);

			Input($$renderer, {
				id: 'state',
				name: 'state',
				placeholder: 'Enter State/Province',
				class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
				get value() {
					return address.state;
				},

				set value($$value) {
					address.state = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div><label for="zip" class="text-gray-700 dark:text-gray-300">Zip/Postal Code:</label> `);

			Input($$renderer, {
				id: 'zip',
				name: 'zip',
				placeholder: 'Enter Zip/Postal Code',
				class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
				get value() {
					return address.zip;
				},

				set value($$value) {
					address.zip = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div><label for="country" class="text-gray-700 dark:text-gray-300">Country:</label>  `);

			$$renderer.select(
				{
					value: address.country,
					id: 'country',
					class: 'mt-1 block h-10 w-full rounded-md bg-background px-3 py-2 shadow-sm focus:outline-none sm:text-sm'
				},
				($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(countries);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let country = each_array[$$index];

						$$renderer.option({ value: country.value }, ($$renderer) => {
							$$renderer.push(`${$.escape(country.name)}`);
						});
					}

					$$renderer.push(`<!--]-->`);
				}
			);

			$$renderer.push(`</div></div> <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Contact Details:</h2> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><div><label for="phone" class="text-gray-700 dark:text-gray-300">Business phone:</label> `);

			Input($$renderer, {
				id: 'phone',
				type: 'phone',
				name: 'phone',
				placeholder: 'Enter Business Phone',
				required: true,
				class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
				get value() {
					return address.phone;
				},

				set value($$value) {
					address.phone = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div><label for="email" class="text-gray-700 dark:text-gray-300">Business email:</label> `);

			Input($$renderer, {
				id: 'email',
				type: 'email',
				name: 'email',
				placeholder: 'Enter Business Email',
				required: true,
				class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
				get value() {
					return address.email;
				},

				set value($$value) {
					address.email = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div> <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Location Details:</h2> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><div><label for="lat" class="text-gray-700 dark:text-gray-300">Latitude:</label> `);

			Input($$renderer, {
				id: 'lat',
				type: 'number',
				name: 'lat',
				placeholder: 'Enter Latitude',
				required: true,
				class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
				get value() {
					return address.lat;
				},

				set value($$value) {
					address.lat = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div><label for="lng" class="text-gray-700 dark:text-gray-300">Longitude:</label> `);

			Input($$renderer, {
				id: 'lng',
				type: 'number',
				name: 'lng',
				placeholder: 'Enter Longitude',
				required: true,
				class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
				get value() {
					return address.lng;
				},

				set value($$value) {
					address.lng = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div> <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Additional Details:</h2> <div class="grid grid-cols-1 gap-4 md:grid-cols-3"><div><label for="isPrimary" class="text-gray-700 dark:text-gray-300">Is Default Location:</label> <input id="isPrimary" type="checkbox" name="isPrimary"${$.attr('checked', address.isPrimary, true)} placeholder="Is Deafult Location" required="" class="mt-1 block h-[20px] w-[20px] rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm"/></div> <div><label for="isResiddential" class="text-gray-700 dark:text-gray-300">Is Resident:</label> <input id="isResiddential" type="checkbox" name="isResiddential"${$.attr('checked', address.isResiddential, true)} placeholder="Is Resident:" required="" class="mt-1 block h-[20px] w-[20px] rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm"/></div> <div class="md:col-span-3"><label for="deliveryInstructions" class="text-gray-700 dark:text-gray-300">Delivery Instructions:</label> <textarea id="deliveryInstructions" name="deliveryInstructions" placeholder="Instructions for Delivery" required="" class="mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm">`);

			const $$body = $.escape(address.deliveryInstructions);

			if ($$body) {
				$$renderer.push(`${$$body}`);
			} else {}

			$$renderer.push(`</textarea></div> <div><label for="locality" class="text-gray-700 dark:text-gray-300">Locality:</label> `);

			Input($$renderer, {
				id: 'locality',
				name: 'locality',
				placeholder: 'Enter Locality',
				required: true,
				class: 'mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none sm:text-sm',
				get value() {
					return address.locality;
				},

				set value($$value) {
					address.locality = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div></form></div></div> <div class="ease-[cubic-bezier(1,.32,.52,.67)] fixed left-0 right-0 top-10 z-50 mx-auto flex w-1/2 max-w-[1000px] flex-row justify-between rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs font-semibold text-black shadow transition-all duration-150 hover:bg-gray-100"${$.attr_style(detailsChanged ? 'display: flex' : 'display: none')}><div class="flex flex-row items-center gap-2">`);
			InfoIcon($$renderer, { class: 'h-4 w-4' });
			$$renderer.push(`<!----> <span>Unsaved changes</span></div> `);

			Button($$renderer, {
				onclick: saveAddress,
				size: 'sm',
				children: ($$renderer) => {
					if (isLoading) {
						$$renderer.push('<!--[0-->');
						Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
					} else {
						$$renderer.push(`<!--[-1-->Save`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}