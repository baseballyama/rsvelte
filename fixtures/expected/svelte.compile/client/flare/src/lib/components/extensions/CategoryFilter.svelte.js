import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button';
import * as Popover from '$lib/components/ui/popover';
import * as Command from '$lib/components/ui/command';
import { ChevronsUpDown, Check } from '@lucide/svelte';
import { extensionsStore } from './store.svelte';
import { focusManager } from '$lib/focus.svelte';

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function CategoryFilter($$anchor, $$props) {
	$.push($$props, true);

	let categoryPopoverOpen = $.state(false);
	const scopeId = `category-filter-${crypto.randomUUID()}`;

	$.user_effect(() => {
		if ($.get(categoryPopoverOpen)) {
			focusManager.requestFocus(scopeId);
		} else {
			focusManager.releaseFocus(scopeId);
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(categoryPopoverOpen);
			},

			set open($$value) {
				$.set(categoryPopoverOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(
							{
								variant: 'ghost',
								role: 'combobox',
								get 'aria-expanded'() {
									return $.get(categoryPopoverOpen);
								},
								class: 'w-48 justify-between'
							},
							props,
							{
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_3 = root();
									var text = $.first_child(fragment_3);
									var node_2 = $.sibling(text);

									ChevronsUpDown(node_2, { class: 'ml-2 size-4 shrink-0 opacity-50' });
									$.template_effect(() => $.set_text(text, `${extensionsStore.selectedCategory ?? ''} `));
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							}
						));
					};

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-48 p-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.component(node_4, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_2();
										var node_5 = $.first_child(fragment_5);

										$.component(node_5, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, { placeholder: 'Search category...' });
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Command.Empty, ($$anchor, Command_Empty) => {
											Command_Empty($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('No category found.');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_8 = $.first_child(fragment_6);

													$.each(node_8, 16, () => extensionsStore.allCategories, (category) => category, ($$anchor, category) => {
														var fragment_7 = $.comment();
														var node_9 = $.first_child(fragment_7);

														$.component(node_9, () => Command.Item, ($$anchor, Command_Item) => {
															Command_Item($$anchor, {
																get value() {
																	return category;
																},

																onSelect: () => {
																	extensionsStore.selectedCategory = category;
																	extensionsStore.selectedIndex = 0;
																	$.set(categoryPopoverOpen, false);
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = root_1();
																	var node_10 = $.first_child(fragment_8);

																	{
																		let $0 = $.derived(() => extensionsStore.selectedCategory !== category ? 'text-transparent' : '');

																		Check(node_10, {
																			get class() {
																				return $.get($0);
																			}
																		});
																	}

																	var text_2 = $.sibling(node_10);

																	$.template_effect(() => $.set_text(text_2, ` ${category ?? ''}`));
																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}