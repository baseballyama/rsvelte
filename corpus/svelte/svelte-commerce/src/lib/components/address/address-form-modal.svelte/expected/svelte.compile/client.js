import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex items-center gap-2"><!> <!></div>`);
var root_1 = $.from_html(`<!> Delete Address`, 1);
var root_2 = $.from_html(`<!> <form class="grid py-4"><div class="grid grid-cols-2 gap-2"><!> <!></div> <!> <!> <!> <div class="grid grid-cols-2 gap-x-2"><!> <!> <!> <!></div> <br/> <div class="flex flex-col gap-2"><!> <!></div></form>`, 1);

export default function Address_form_modal($$anchor, $$props) {
	$.push($$props, true);

	// Local shadow of the vendored renderer — it never passed `isSaving` through, never awaited
	// `onsave` and closed the dialog even when the save failed. See the file header.
	let show = $.prop($$props, 'show', 15),
		address = $.prop($$props, 'address', 15);

	{
		const content = ($$anchor, $$arg0) => {
			let isSaving = () => ($$arg0?.()).isSaving;
			let handleBack = () => ($$arg0?.()).handleBack;
			let handleSubmit = () => ($$arg0?.()).handleSubmit;
			let handleDelete = () => ($$arg0?.()).handleDelete;

			Dialog($$anchor, {
				get open() {
					return show();
				},

				set open($$value) {
					show($$value);
				},

				children: ($$anchor, $$slotProps) => {
					DialogContent($$anchor, {
						class: 'sm:max-w-[425px] [&>button]:!bg-transparent',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var node = $.first_child(fragment_3);

							DialogHeader(node, {
								children: ($$anchor, $$slotProps) => {
									var div = root();
									var node_1 = $.child(div);

									Button(node_1, {
										variant: 'ghost',
										size: 'icon',
										'aria-label': 'Back to address list',
										get onclick() {
											return handleBack();
										},

										children: ($$anchor, $$slotProps) => {
											ArrowLeft($$anchor, { class: 'h-4 w-4' });
										},
										$$slots: { default: true }
									});

									var node_2 = $.sibling(node_1, 2);

									DialogTitle(node_2, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, $$props.isEdit ? 'Edit Address' : 'Add New Address'));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									$.reset(div);
									$.append($$anchor, div);
								},
								$$slots: { default: true }
							});

							var form = $.sibling(node, 2);
							var div_1 = $.child(form);
							var node_3 = $.child(div_1);

							Textbox(node_3, {
								name: 'firstName',
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

							var node_4 = $.sibling(node_3, 2);

							Textbox(node_4, {
								name: 'lastName',
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

							$.reset(div_1);

							var node_5 = $.sibling(div_1, 2);

							{
								let $0 = $.derived(() => page?.data?.store?.isPhoneMandatory
									? ''
									: 'Phone number is recommended for delivery updates.');

								let $1 = $.derived(() => page.data?.store?.isPhoneMandatory);

								Textbox(node_5, {
									get info() {
										return $.get($0);
									},

									get required() {
										return $.get($1);
									},
									name: 'phone',
									type: 'tel',
									placeholder: '+1234567890',
									get schema() {
										return AddressSchema.phone;
									},
									label: 'Phone',
									get value() {
										return address().phone;
									},

									set value($$value) {
										address(address().phone = $$value, true);
									}
								});
							}

							var node_6 = $.sibling(node_5, 2);

							Textbox(node_6, {
								name: 'address_1',
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

							var node_7 = $.sibling(node_6, 2);

							Textbox(node_7, {
								name: 'address_2',
								placeholder: 'Apartment, suite, etc.',
								label: 'Address Line 2',
								get value() {
									return address().address_2;
								},

								set value($$value) {
									address(address().address_2 = $$value, true);
								}
							});

							var div_2 = $.sibling(node_7, 2);
							var node_8 = $.child(div_2);

							Textbox(node_8, {
								name: 'city',
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

							var node_9 = $.sibling(node_8, 2);

							Textbox(node_9, {
								name: 'state',
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

							var node_10 = $.sibling(node_9, 2);

							{
								let $0 = $.derived(() => address().countryCode || page?.data?.store?.country?.code || 'AU');
								let $1 = $.derived(() => page?.data?.store?.countries || []);

								Select(node_10, {
									id: 'countryCode',
									title: 'Select Country',
									label: 'Country',
									showSearch: true,
									get value() {
										return $.get($0);
									},

									get data() {
										return $.get($1);
									},
									valueField: 'code',
									optionSelected: (v) => {
										address(address().countryCode = v, true);
									}
								});
							}

							var node_11 = $.sibling(node_10, 2);

							Textbox(node_11, {
								name: 'zip',
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

							var div_3 = $.sibling(div_2, 4);
							var node_12 = $.child(div_3);

							Button(node_12, {
								type: 'submit',
								class: 'w-full',
								get disabled() {
									return isSaving();
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_13 = $.first_child(fragment_6);

									{
										var consequent = ($$anchor) => {
											LoadingDots($$anchor, {});
										};

										var alternate = ($$anchor) => {
											var text_1 = $.text('Save Contact');

											$.append($$anchor, text_1);
										};

										$.if(node_13, ($$render) => {
											if (isSaving()) $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							var node_14 = $.sibling(node_12, 2);

							{
								var consequent_1 = ($$anchor) => {
									Button($$anchor, {
										type: 'button',
										variant: 'link',
										get onclick() {
											return handleDelete();
										},
										class: 'w-full text-red-700',
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root_1();
											var node_15 = $.first_child(fragment_9);

											Trash2(node_15, { class: 'h-4 w-4' });
											$.next();
											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								};

								$.if(node_14, ($$render) => {
									if ($$props.isEdit) $$render(consequent_1);
								});
							}

							$.reset(div_3);
							$.reset(form);

							$.event('submit', form, function (...$$args) {
								handleSubmit()?.apply(this, $$args);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		AddressFormRenderer($$anchor, {
			get onback() {
				return $$props.onback;
			},

			get ondelete() {
				return $$props.ondelete;
			},

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
				return show();
			},

			set show($$value) {
				show($$value);
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}