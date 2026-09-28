import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
import { AddressListModule } from '$lib/core/composables/index.js';
import { LoaderCircle, PencilIcon as PencilSimple, Plus, Trash2 } from '@lucide/svelte';

export default function Address_list_modal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			show = void 0,
			paginateAddress,
			addresses,
			onedit,
			onselect,
			onaddnew,
			ondelete
		} = $$props;

		const addressState = new AddressListModule({ paginateAddress, onaddnew, onedit, onselect });
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
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
									DialogTitle($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Select Address`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <div class="grid max-h-[400px] gap-4 overflow-y-auto py-4">`);

							Button($$renderer, {
								variant: 'outline',
								class: 'w-full',
								onclick: addressState.handleAddNew,
								children: ($$renderer) => {
									Plus($$renderer, { class: 'mr-2 h-4 w-4' });
									$$renderer.push(`<!----> Add New Address`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like(addresses);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let address = each_array[$$index];

								$$renderer.push(`<div class="group flex items-center justify-between rounded-lg border p-4"><div class="flex-1"><p class="font-medium">${$.escape(address.firstName)} ${$.escape(address.lastName)}</p> <p class="text-sm text-gray-500">${$.escape(address.address_1)}</p> <p class="text-sm text-gray-500">${$.escape(address.address_2)}</p> <p class="text-sm text-gray-500">${$.escape(address.city)}, ${$.escape(address.state)}
							${$.escape(address.zip)}</p> <p class="text-sm text-gray-500">${$.escape(address.phone)}</p></div> <div class="flex flex-col gap-2"><div class="flex justify-between gap-2">`);

								Button($$renderer, {
									variant: 'ghost',
									onclick: () => addressState.handleEdit(address),
									class: 'w-fit opacity-0 group-hover:opacity-100',
									children: ($$renderer) => {
										PencilSimple($$renderer, { class: 'h-4 w-4' });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									type: 'button',
									variant: 'ghost',
									disabled: addressState.cartState?.cart?.shippingAddress?.id === address.id,
									onclick: () => ondelete?.(address),
									class: 'w-fit opacity-0 group-hover:opacity-100',
									children: ($$renderer) => {
										Trash2($$renderer, { class: 'h-4 w-4' });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div> `);

								Button($$renderer, {
									variant: 'default',
									onclick: () => addressState.handleSelect(address),
									children: ($$renderer) => {
										$$renderer.push(`<!---->Select`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div></div>`);
							}

							$$renderer.push(`<!--]--> <div class="flex h-12 w-full items-center justify-center">`);

							if (addressState.loading) {
								$$renderer.push('<!--[0-->');
								LoaderCircle($$renderer, { class: 'animate-spin' });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div></div>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { show });
	});
}