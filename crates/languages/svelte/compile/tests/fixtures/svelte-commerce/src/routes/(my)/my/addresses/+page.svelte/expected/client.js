import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	LoaderCircle,
	Plus,
	Trash2,
	MapPin,
	Pencil,
	Home,
	Briefcase,
	Phone,
	MoreVertical
} from '@lucide/svelte';

import { Button } from '$lib/components/ui/button';
import AddressFormModal from '$lib/components/address/address-form-modal.svelte';
import * as Dialog from '$lib/components/ui/dialog';
import Pagination from '$lib/components/common/pagination.svelte';
import { MyAddressesModule, MyOrdersRenderer } from '$lib/core/composables/index.js';
import { fade, fly } from 'svelte/transition';

var root = $.from_html(`<!> Add New Address`, 1);
var root_1 = $.from_html(`<div class="flex min-h-[400px] items-center justify-center"><!></div>`);
var root_2 = $.from_html(`<div class="col-span-full flex flex-col items-center justify-center py-20 text-center"><div class="relative mb-6"><div class="absolute inset-0 scale-150 animate-pulse rounded-full bg-gray-50"></div> <div class="relative flex h-24 w-24 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm"><!></div></div> <h2 class="text-2xl font-bold text-gray-900">No addresses yet</h2> <p class="mt-2 max-w-xs text-gray-500">Add an address to speed up your checkout process.</p></div>`);
var root_3 = $.from_html(`<!> Edit`, 1);
var root_4 = $.from_html(`<!> Delete`, 1);
var root_5 = $.from_html(`<div class="group relative flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-300 "><div class="flex flex-1 flex-col p-6 pb-4"><div class="mb-4 flex items-start justify-between"><div><p class="text-sm font-bold uppercase tracking-widest text-gray-900"> </p></div></div> <div class="space-y-1 text-sm font-medium leading-relaxed text-gray-500"><p> <!></p> <p class="text-gray-900"> </p> <p> </p></div> <div class="mt-6 flex items-center gap-2 text-xs font-bold text-gray-400"><!> </div></div> <div class="flex border-t border-gray-100"><!> <!></div></div>`);
var root_6 = $.from_html(`<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"><!></div> <div class="mt-12 flex justify-center"><!></div>`, 1);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<div class="mx-auto max-w-7xl px-0 md:py-8 md:py-12"><div class="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><h1 class="text-lg font-bold tracking-tight text-gray-900 md:text-xl">Your Addresses</h1> <p class="mt-2 text-sm text-gray-500">Manage your shipping and billing addresses.</p></div> <!></div> <!> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const addressesModule = new MyAddressesModule();
	let showDeleteConfirmation = $.state(false);
	let addressToDelete = $.state(null);

	function confirmDelete(address) {
		$.set(addressToDelete, address, true);
		$.set(showDeleteConfirmation, true);
	}

	async function handleDeleteConfirmation() {
		if ($.get(addressToDelete)) {
			await addressesModule.handleDelete($.get(addressToDelete));
			$.set(showDeleteConfirmation, false);
			$.set(addressToDelete, null);
		}
	}

	var div = root_8();

	$.head('1a119a0', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Addresses | Svelte Commerce';
		});
	});

	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	Button(node, {
		get onclick() {
			return addressesModule.handleAddNew;
		},
		class: 'h-12 px-6',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Plus(node_1, { class: 'mr-2 h-4 w-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root_1();
			var node_3 = $.child(div_2);

			LoaderCircle(node_3, { class: 'h-8 w-8 animate-spin text-primary' });
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		var consequent_3 = ($$anchor) => {
			var fragment_1 = root_6();
			var div_3 = $.first_child(fragment_1);
			var node_4 = $.child(div_3);

			{
				var consequent_1 = ($$anchor) => {
					var div_4 = root_2();
					var div_5 = $.child(div_4);
					var div_6 = $.sibling($.child(div_5), 2);
					var node_5 = $.child(div_6);

					MapPin(node_5, { class: 'h-10 w-10 text-gray-300' });
					$.reset(div_6);
					$.reset(div_5);
					$.next(4);
					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				var alternate = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_6 = $.first_child(fragment_2);

					$.each(node_6, 19, () => addressesModule.addresses?.data, (address) => address.id, ($$anchor, address, i) => {
						var div_7 = root_5();
						var div_8 = $.child(div_7);
						var div_9 = $.child(div_8);
						var div_10 = $.child(div_9);
						var p = $.child(div_10);
						var text = $.only_child(p);

						$.reset(div_10);
						$.reset(div_9);

						var div_11 = $.sibling(div_9, 2);
						var p_1 = $.child(div_11);
						var text_1 = $.child(p_1);
						var node_7 = $.sibling(text_1);

						{
							var consequent_2 = ($$anchor) => {
								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, `, ${$.get(address).address_2 ?? ''}`));
								$.append($$anchor, text_2);
							};

							$.if(node_7, ($$render) => {
								if ($.get(address).address_2) $$render(consequent_2);
							});
						}

						$.reset(p_1);

						var p_2 = $.sibling(p_1, 2);
						var text_3 = $.only_child(p_2);
						var p_3 = $.sibling(p_2, 2);
						var text_4 = $.only_child(p_3, true);

						$.reset(div_11);

						var div_12 = $.sibling(div_11, 2);
						var node_8 = $.child(div_12);

						Phone(node_8, { class: 'h-3.5 w-3.5' });

						var text_5 = $.sibling(node_8);

						$.reset(div_12);
						$.reset(div_8);

						var div_13 = $.sibling(div_8, 2);
						var node_9 = $.child(div_13);

						Button(node_9, {
							variant: 'ghost',
							onclick: () => addressesModule.handleEdit($.get(address)),
							class: 'flex-1 h-auto py-3 rounded-none border-r border-gray-100',
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_3();
								var node_10 = $.first_child(fragment_4);

								Pencil(node_10, { class: 'h-3 w-3 mr-2' });
								$.next();
								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						var node_11 = $.sibling(node_9, 2);

						Button(node_11, {
							variant: 'ghost',
							onclick: () => confirmDelete($.get(address)),
							class: 'flex-1 h-auto py-3 rounded-none text-red-500',
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root_4();
								var node_12 = $.first_child(fragment_5);

								Trash2(node_12, { class: 'h-3 w-3 mr-2' });
								$.next();
								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});

						$.reset(div_13);
						$.reset(div_7);

						$.template_effect(() => {
							$.set_text(text, `${$.get(address).firstName ?? ''} ${$.get(address).lastName ?? ''}`);
							$.set_text(text_1, `${$.get(address).address_1 ?? ''} `);
							$.set_text(text_3, `${$.get(address).city ?? ''}, ${$.get(address).state ?? ''} ${$.get(address).zip ?? ''}`);
							$.set_text(text_4, $.get(address).country);
							$.set_text(text_5, ` ${$.get(address).phone ?? ''}`);
						});

						$.transition(1, div_7, () => fly, () => ({ y: 20, duration: 400, delay: $.get(i) * 50 }));
						$.append($$anchor, div_7);
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_4, ($$render) => {
					if (addressesModule.addresses?.data?.length === 0) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(div_3);

			var div_14 = $.sibling(div_3, 2);
			var node_13 = $.child(div_14);

			{
				let $0 = $.derived(() => Math.ceil(addressesModule.addresses.count / addressesModule.addresses.pageSize));

				Pagination(node_13, {
					get noOfPage() {
						return $.get($0);
					},

					get paginateProducts() {
						return addressesModule.paginateAddress;
					}
				});
			}

			$.reset(div_14);
			$.transition(1, div_3, () => fade);
			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if (addressesModule.loading) $$render(consequent); else if (addressesModule.addresses) $$render(consequent_3, 1);
		});
	}

	var node_14 = $.sibling(node_2, 2);

	AddressFormModal(node_14, {
		get isEdit() {
			return addressesModule.isEditing;
		},

		get onsave() {
			return addressesModule.handleSave;
		},
		ondelete: confirmDelete,
		get show() {
			return addressesModule.showAddressFormModal;
		},

		set show($$value) {
			addressesModule.showAddressFormModal = $$value;
		},

		get address() {
			return addressesModule.selectedAddress;
		},

		set address($$value) {
			addressesModule.selectedAddress = $$value;
		}
	});

	var node_15 = $.sibling(node_14, 2);

	$.component(node_15, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(showDeleteConfirmation);
			},

			set open($$value) {
				$.set(showDeleteConfirmation, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_6 = $.comment();
				var node_16 = $.first_child(fragment_6);

				$.component(node_16, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-[425px]',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_7();
							var node_17 = $.first_child(fragment_7);

							$.component(node_17, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_7();
										var node_18 = $.first_child(fragment_8);

										$.component(node_18, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Delete Address');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_19 = $.sibling(node_18, 2);

										$.component(node_19, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Are you sure you want to delete this address? This action cannot be undone.');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							var node_20 = $.sibling(node_17, 2);

							$.component(node_20, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									class: 'mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end',
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root_7();
										var node_21 = $.first_child(fragment_9);

										Button(node_21, {
											variant: 'outline',
											onclick: () => $.set(showDeleteConfirmation, false),
											class: 'flex-1 sm:flex-none',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('Cancel');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});

										var node_22 = $.sibling(node_21, 2);

										Button(node_22, {
											variant: 'destructive',
											onclick: handleDeleteConfirmation,
											class: 'flex-1 sm:flex-none',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Delete');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}