import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
import { AddressListModule } from '$lib/core/composables/index.js';
import { LoaderCircle, PencilIcon as PencilSimple, Plus, Trash2 } from '@lucide/svelte';

var root = $.from_html(`<!> Add New Address`, 1);
var root_1 = $.from_html(`<div class="group flex items-center justify-between rounded-lg border p-4"><div class="flex-1"><p class="font-medium"> </p> <p class="text-sm text-gray-500"> </p> <p class="text-sm text-gray-500"> </p> <p class="text-sm text-gray-500"> </p> <p class="text-sm text-gray-500"> </p></div> <div class="flex flex-col gap-2"><div class="flex justify-between gap-2"><!> <!></div> <!></div></div>`);
var root_2 = $.from_html(`<!> <div class="grid max-h-[400px] gap-4 overflow-y-auto py-4"><!> <!> <div class="flex h-12 w-full items-center justify-center"><!></div></div>`, 1);

export default function Address_list_modal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15);

	const addressState = new AddressListModule({
		paginateAddress: $$props.paginateAddress,
		onaddnew: $$props.onaddnew,
		onedit: $$props.onedit,
		onselect: $$props.onselect
	});

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
					var fragment_2 = root_2();
					var node = $.first_child(fragment_2);

					DialogHeader(node, {
						children: ($$anchor, $$slotProps) => {
							DialogTitle($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Select Address');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var div = $.sibling(node, 2);
					var node_1 = $.child(div);

					Button(node_1, {
						variant: 'outline',
						class: 'w-full',
						get onclick() {
							return addressState.handleAddNew;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_2 = $.first_child(fragment_4);

							Plus(node_2, { class: 'mr-2 h-4 w-4' });
							$.next();
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_1, 2);

					$.each(node_3, 17, () => $$props.addresses, (address) => address.id, ($$anchor, address) => {
						var div_1 = root_1();
						var div_2 = $.child(div_1);
						var p = $.child(div_2);
						var text_1 = $.only_child(p);
						var p_1 = $.sibling(p, 2);
						var text_2 = $.only_child(p_1, true);
						var p_2 = $.sibling(p_1, 2);
						var text_3 = $.only_child(p_2, true);
						var p_3 = $.sibling(p_2, 2);
						var text_4 = $.only_child(p_3);
						var p_4 = $.sibling(p_3, 2);
						var text_5 = $.only_child(p_4, true);

						$.reset(div_2);

						var div_3 = $.sibling(div_2, 2);
						var div_4 = $.child(div_3);
						var node_4 = $.child(div_4);

						Button(node_4, {
							variant: 'ghost',
							onclick: () => addressState.handleEdit($.get(address)),
							class: 'w-fit opacity-0 group-hover:opacity-100',
							children: ($$anchor, $$slotProps) => {
								PencilSimple($$anchor, { class: 'h-4 w-4' });
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						{
							let $0 = $.derived(() => addressState.cartState?.cart?.shippingAddress?.id === $.get(address).id);

							Button(node_5, {
								type: 'button',
								variant: 'ghost',
								get disabled() {
									return $.get($0);
								},
								onclick: () => $$props.ondelete?.($.get(address)),
								class: 'w-fit opacity-0 group-hover:opacity-100',
								children: ($$anchor, $$slotProps) => {
									Trash2($$anchor, { class: 'h-4 w-4' });
								},
								$$slots: { default: true }
							});
						}

						$.reset(div_4);

						var node_6 = $.sibling(div_4, 2);

						Button(node_6, {
							variant: 'default',
							onclick: () => addressState.handleSelect($.get(address)),
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Select');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});

						$.reset(div_3);
						$.reset(div_1);

						$.template_effect(() => {
							$.set_text(text_1, `${$.get(address).firstName ?? ''} ${$.get(address).lastName ?? ''}`);
							$.set_text(text_2, $.get(address).address_1);
							$.set_text(text_3, $.get(address).address_2);

							$.set_text(text_4, `${$.get(address).city ?? ''}, ${$.get(address).state ?? ''}
							${$.get(address).zip ?? ''}`);

							$.set_text(text_5, $.get(address).phone);
						});

						$.append($$anchor, div_1);
					});

					var div_5 = $.sibling(node_3, 2);
					var node_7 = $.child(div_5);

					{
						var consequent = ($$anchor) => {
							LoaderCircle($$anchor, { class: 'animate-spin' });
						};

						$.if(node_7, ($$render) => {
							if (addressState.loading) $$render(consequent);
						});
					}

					$.reset(div_5);
					$.bind_this(div_5, ($$value) => addressState.loadMoreTrigger = $$value, () => addressState?.loadMoreTrigger);
					$.reset(div);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}