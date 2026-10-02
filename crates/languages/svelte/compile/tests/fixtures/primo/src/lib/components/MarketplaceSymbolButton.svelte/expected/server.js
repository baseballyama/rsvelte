import * as $ from 'svelte/internal/server';
import { toast } from 'svelte-sonner';
import { Label } from '$lib/components/ui/label';
import * as Popover from '$lib/components/ui/popover';
import SitePreview from '$lib/components/SitePreview.svelte';
import { CirclePlus, CircleCheck } from 'lucide-svelte';
import { find as _find } from 'lodash-es';
import { Button, buttonVariants } from '$lib/components/ui/button';
import * as RadioGroup from '$lib/components/ui/radio-group';
import { SiteSymbol } from '$lib/common/models/SiteSymbol';
import { LibrarySymbolGroups } from '$lib/pocketbase/collections';

export default function MarketplaceSymbolButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {SiteSymbol} symbol
		 * @property {string | null} [preview]
		 * @property {string} [head]
		 */
		/** @type {Props} */
		let { symbol, preview = null, head = '' } = $$props;

		if (!preview) {
			get_preview();
		}

		async function get_preview() {
			// TODO: Implement
		}

		let selected_group_id = LibrarySymbolGroups.list()?.[0]?.id ?? '';
		let is_popover_open = false;
		let added_to_library = false;

		async function add_to_library() {
			// await actions.add_marketplace_symbol_to_library({ symbol, preview, group_id })
			// TODO: Implement
			throw new Error('Not implemented');

			toast.success('Added Block to Library');
			added_to_library = true;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-3 relative w-full bg-gray-900"><div class="w-full rounded-tl rounded-tr overflow-hidden h-[10rem] aspect-[1.5]">`);
			SitePreview($$renderer, { preview, head });
			$$renderer.push(`<!----></div> <div class="absolute -bottom-2 rounded-bl rounded-br w-full p-3 z-20 bg-gray-900 truncate flex items-center justify-between"><div class="text-sm font-medium leading-none">${$.escape(symbol.name)}</div> `);

			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					get open() {
						return is_popover_open;
					},

					set open($$value) {
						is_popover_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Popover.Trigger) {
							$$renderer.push('<!--[-->');

							Popover.Trigger($$renderer, {
								class: buttonVariants({ variant: 'ghost', class: 'h-4 p-0' }),
								children: ($$renderer) => {
									if (added_to_library) {
										$$renderer.push('<!--[0-->');
										CircleCheck($$renderer, {});
									} else {
										$$renderer.push('<!--[-1-->');
										CirclePlus($$renderer, {});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								class: 'w-80',
								children: ($$renderer) => {
									$$renderer.push(`<div class="grid gap-4"><div class="space-y-2"><h4 class="font-medium leading-none">Add to Library</h4> <p class="text-muted-foreground text-sm">Select a group for this block</p></div> `);

									if (RadioGroup.Root) {
										$$renderer.push('<!--[-->');

										RadioGroup.Root($$renderer, {
											get value() {
												return selected_group_id;
											},

											set value($$value) {
												selected_group_id = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(LibrarySymbolGroups.list() ?? []);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let group = each_array[$$index];

													$$renderer.push(`<div class="flex items-center space-x-2">`);

													if (RadioGroup.Item) {
														$$renderer.push('<!--[-->');
														RadioGroup.Item($$renderer, { value: group.id, id: group.id });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Label($$renderer, {
														for: group.id,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(group.name)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div>`);
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <div class="flex justify-end">`);

									Button($$renderer, {
										onclick: () => {
											add_to_library();
											is_popover_open = false;
										},

										children: ($$renderer) => {
											$$renderer.push(`<!---->Add to Library`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}