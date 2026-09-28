import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex items-center space-x-2"><!> <!></div>`);
var root_1 = $.from_html(`<div class="grid gap-4"><div class="space-y-2"><h4 class="font-medium leading-none">Add to Library</h4> <p class="text-muted-foreground text-sm">Select a group for this block</p></div> <!> <div class="flex justify-end"><!></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="space-y-3 relative w-full bg-gray-900"><div class="w-full rounded-tl rounded-tr overflow-hidden h-[10rem] aspect-[1.5]"><!></div> <div class="absolute -bottom-2 rounded-bl rounded-br w-full p-3 z-20 bg-gray-900 truncate flex items-center justify-between"><div class="text-sm font-medium leading-none"> </div> <!></div></div>`);

export default function MarketplaceSymbolButton($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {SiteSymbol} symbol
	 * @property {string | null} [preview]
	 * @property {string} [head]
	 */
	/** @type {Props} */
	let preview = $.prop($$props, 'preview', 3, null),
		head = $.prop($$props, 'head', 3, '');

	if (!preview()) {
		get_preview();
	}

	async function get_preview() {
		// TODO: Implement
	}

	let selected_group_id = $.state($.proxy(LibrarySymbolGroups.list()?.[0]?.id ?? ''));
	let is_popover_open = $.state(false);
	let added_to_library = $.state(false);

	async function add_to_library() {
		// await actions.add_marketplace_symbol_to_library({ symbol, preview, group_id })
		// TODO: Implement
		throw new Error('Not implemented');

		toast.success('Added Block to Library');
		$.set(added_to_library, true);
	}

	var div = root_3();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	SitePreview(node, {
		get preview() {
			return preview();
		},

		get head() {
			return head();
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var text = $.only_child(div_3, true);
	var node_1 = $.sibling(div_3, 2);

	$.component(node_1, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(is_popover_open);
			},

			set open($$value) {
				$.set(is_popover_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_2 = $.first_child(fragment);

				{
					let $0 = $.derived(() => buttonVariants({ variant: 'ghost', class: 'h-4 p-0' }));

					$.component(node_2, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_1 = $.comment();
								var node_3 = $.first_child(fragment_1);

								{
									var consequent = ($$anchor) => {
										CircleCheck($$anchor, {});
									};

									var alternate = ($$anchor) => {
										CirclePlus($$anchor, {});
									};

									$.if(node_3, ($$render) => {
										if ($.get(added_to_library)) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_1);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-80',
						children: ($$anchor, $$slotProps) => {
							var div_4 = root_1();
							var node_5 = $.sibling($.child(div_4), 2);

							$.component(node_5, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
								RadioGroup_Root($$anchor, {
									get value() {
										return $.get(selected_group_id);
									},

									set value($$value) {
										$.set(selected_group_id, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.each(node_6, 17, () => LibrarySymbolGroups.list() ?? [], $.index, ($$anchor, group) => {
											var div_5 = root();
											var node_7 = $.child(div_5);

											$.component(node_7, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
												RadioGroup_Item($$anchor, {
													get value() {
														return $.get(group).id;
													},

													get id() {
														return $.get(group).id;
													}
												});
											});

											var node_8 = $.sibling(node_7, 2);

											Label(node_8, {
												get for() {
													return $.get(group).id;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, $.get(group).name));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});

											$.reset(div_5);
											$.append($$anchor, div_5);
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var div_6 = $.sibling(node_5, 2);
							var node_9 = $.child(div_6);

							Button(node_9, {
								onclick: () => {
									add_to_library();
									$.set(is_popover_open, false);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Add to Library');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.reset(div_6);
							$.reset(div_4);
							$.append($$anchor, div_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $$props.symbol.name));
	$.append($$anchor, div);
	$.pop();
}