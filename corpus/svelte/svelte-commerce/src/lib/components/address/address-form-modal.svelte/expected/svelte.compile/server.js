import * as $ from 'svelte/internal/server';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowLeft, Trash2 } from '@lucide/svelte';
import Textbox from '$lib/components/form/textbox.svelte';
import Select from '../form/select.svelte';
import { page } from '$app/state';
import Label from '../ui/label/label.svelte';
import { AddressSchema } from '$lib/core/components/index.js';
import AddressFormRenderer from './address-form-renderer.svelte';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';

export default function Address_form_modal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Local shadow of the vendored renderer — it never passed `isSaving` through, never awaited
		// `onsave` and closed the dialog even when the save failed. See the file header.
		let {
			show = void 0,
			address = void 0,
			isEdit,
			onsave,
			onback,
			onclose,
			ondelete
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function content(
					$$renderer,
					{ isSaving, handleBack, handleSubmit, handleDelete }
				) {
					Dialog($$renderer, {
						get open() {
							return show;
						},

						set open($$value) {
							show = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							DialogContent($$renderer, {
								class: 'sm:max-w-[425px] [&>button]:!bg-transparent',
								children: ($$renderer) => {
									DialogHeader($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<div class="flex items-center gap-2">`);

											Button($$renderer, {
												variant: 'ghost',
												size: 'icon',
												'aria-label': 'Back to address list',
												onclick: handleBack,
												children: ($$renderer) => {
													ArrowLeft($$renderer, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											DialogTitle($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(isEdit ? 'Edit Address' : 'Add New Address')}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <form class="grid py-4"><div class="grid grid-cols-2 gap-2">`);

									Textbox($$renderer, {
										name: 'firstName',
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

									$$renderer.push(`<!----></div> `);

									Textbox($$renderer, {
										info: page?.data?.store?.isPhoneMandatory
											? ''
											: 'Phone number is recommended for delivery updates.',
										required: page.data?.store?.isPhoneMandatory,
										name: 'phone',
										type: 'tel',
										placeholder: '+1234567890',
										schema: AddressSchema.phone,
										label: 'Phone',
										get value() {
											return address.phone;
										},

										set value($$value) {
											address.phone = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									Textbox($$renderer, {
										name: 'address_1',
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

									$$renderer.push(`<!----> <div class="grid grid-cols-2 gap-x-2">`);

									Textbox($$renderer, {
										name: 'city',
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

									$$renderer.push(`<!----> `);

									Select($$renderer, {
										id: 'countryCode',
										title: 'Select Country',
										label: 'Country',
										showSearch: true,
										value: address.countryCode || page?.data?.store?.country?.code || 'AU',
										data: page?.data?.store?.countries || [],
										valueField: 'code',
										optionSelected: (v) => {
											address.countryCode = v;
										}
									});

									$$renderer.push(`<!----> `);

									Textbox($$renderer, {
										name: 'zip',
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
										class: 'w-full',
										disabled: isSaving,
										children: ($$renderer) => {
											if (isSaving) {
												$$renderer.push('<!--[0-->');
												LoadingDots($$renderer, {});
											} else {
												$$renderer.push(`<!--[-1-->Save Contact`);
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									if (isEdit) {
										$$renderer.push('<!--[0-->');

										Button($$renderer, {
											type: 'button',
											variant: 'link',
											onclick: handleDelete,
											class: 'w-full text-red-700',
											children: ($$renderer) => {
												Trash2($$renderer, { class: 'h-4 w-4' });
												$$renderer.push(`<!----> Delete Address`);
											},
											$$slots: { default: true }
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div></form>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				}

				AddressFormRenderer($$renderer, {
					onback,
					ondelete,
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
		$.bind_props($$props, { show, address });
	});
}