import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Command from '$lib/components/ui/command';
import { Command as CommandPrimitive } from 'bits-ui';
import data from '@emoji-mart/data';
import * as casing from '$lib/utils/casing';
import { makeValue, parseValue, useEmojiPickerList } from './emoji-picker.svelte.js';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'emptyMessage',
	'class'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Emoji_picker_list($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		emptyMessage = $.prop($$props, 'emptyMessage', 3, 'No results.'),
		rest = $.rest_props($$props, rest_excludes);

	const emojiData = data;

	const filter = (value, keywords) => {
		if (!Array.isArray(keywords)) {
			return false;
		}

		for (const keyword of keywords) {
			if (keyword.toLowerCase().startsWith(value.toLowerCase())) return true;
		}

		return false;
	};

	const pickerState = useEmojiPickerList();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('relative h-[200px]', $$props.class));

		$.component(node, () => Command.List, ($$anchor, Command_List) => {
			Command_List($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => rest,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => Command.Empty, ($$anchor, Command_Empty) => {
							Command_Empty($$anchor, {
								class: 'absolute inset-0 flex place-items-center justify-center py-0',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, emptyMessage()));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						{
							var consequent_1 = ($$anchor) => {
								const recents = $.derived(() => pickerState.root.frecency?.items.filter((item) => {
									const { name } = parseValue(item);

									return filter(pickerState.root.emojiPickerState.search, emojiData.emojis[name].keywords);
								}).slice(0, pickerState.maxRecents));

								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								{
									var consequent = ($$anchor) => {
										var fragment_4 = $.comment();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => CommandPrimitive.Group, ($$anchor, CommandPrimitive_Group) => {
											CommandPrimitive_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_5 = $.first_child(fragment_5);

													$.component(node_5, () => CommandPrimitive.GroupHeading, ($$anchor, CommandPrimitive_GroupHeading) => {
														CommandPrimitive_GroupHeading($$anchor, {
															class: 'text-muted-foreground px-2 py-1 text-xs',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Recents');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => CommandPrimitive.GroupItems, ($$anchor, CommandPrimitive_GroupItems) => {
														CommandPrimitive_GroupItems($$anchor, {
															class: 'grid grid-cols-6 px-2',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_7 = $.first_child(fragment_6);

																$.each(node_7, 16, () => $.get(recents), (item) => item, ($$anchor, item) => {
																	const computed_const = $.derived(() => {
																		return parseValue(item);
																	});

																	const emoji = $.derived(() => emojiData.emojis[$.get(computed_const).name].skins[$.get(computed_const).skin].native);
																	var fragment_7 = $.comment();
																	var node_8 = $.first_child(fragment_7);

																	$.component(node_8, () => Command.Item, ($$anchor, Command_Item) => {
																		Command_Item($$anchor, {
																			class: 'flex aspect-square size-9 place-items-center justify-center text-lg [&_svg]:hidden!',
																			get value() {
																				return `${item ?? ''}:recent`;
																			},

																			onSelect: () => {
																				pickerState.select(item);
																				pickerState.root.frecency?.use(item);
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_2 = $.text();

																				$.template_effect(() => $.set_text(text_2, $.get(emoji)));
																				$.append($$anchor, text_2);
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
									};

									$.if(node_3, ($$render) => {
										if ($.get(recents) && $.get(recents).length > 0) $$render(consequent);
									});
								}

								$.append($$anchor, fragment_3);
							};

							$.if(node_2, ($$render) => {
								if (pickerState.showRecents) $$render(consequent_1);
							});
						}

						var node_9 = $.sibling(node_2, 2);

						$.each(node_9, 17, () => emojiData.categories, (category) => category.id, ($$anchor, category) => {
							const emojis = $.derived(() => $.get(category).emojis.filter((item) => filter(pickerState.root.emojiPickerState.search, emojiData.emojis[item].keywords)));
							var fragment_9 = $.comment();
							var node_10 = $.first_child(fragment_9);

							{
								var consequent_2 = ($$anchor) => {
									var fragment_10 = $.comment();
									var node_11 = $.first_child(fragment_10);

									$.component(node_11, () => CommandPrimitive.Group, ($$anchor, CommandPrimitive_Group_1) => {
										CommandPrimitive_Group_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root();
												var node_12 = $.first_child(fragment_11);

												$.component(node_12, () => CommandPrimitive.GroupHeading, ($$anchor, CommandPrimitive_GroupHeading_1) => {
													CommandPrimitive_GroupHeading_1($$anchor, {
														class: 'text-muted-foreground px-2 py-1 text-xs',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text();

															$.template_effect(($0) => $.set_text(text_3, $0), [() => casing.camelToPascal($.get(category).id)]);
															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => CommandPrimitive.GroupItems, ($$anchor, CommandPrimitive_GroupItems_1) => {
													CommandPrimitive_GroupItems_1($$anchor, {
														class: 'grid grid-cols-6 px-2',
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = $.comment();
															var node_14 = $.first_child(fragment_13);

															$.each(node_14, 16, () => $.get(emojis), (item) => item, ($$anchor, item) => {
																const emoji = $.derived(() => emojiData.emojis[item]);
																const emojiSkin = $.derived(() => $.get(emoji).skins.length > 1 ? pickerState.skinIndex : 0);
																const key = $.derived(() => makeValue(item, $.get(emojiSkin)));
																var fragment_14 = $.comment();
																var node_15 = $.first_child(fragment_14);

																$.component(node_15, () => Command.Item, ($$anchor, Command_Item_1) => {
																	Command_Item_1($$anchor, {
																		class: 'flex aspect-square size-9 place-items-center justify-center text-lg [&_svg]:hidden!',
																		get value() {
																			return item;
																		},

																		onSelect: () => {
																			pickerState.select($.get(key));
																			pickerState.root.frecency?.use($.get(key));
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text();

																			$.template_effect(() => $.set_text(text_4, $.get(emoji).skins[$.get(emojiSkin)].native));
																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_14);
															});

															$.append($$anchor, fragment_13);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_11);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_10);
								};

								$.if(node_10, ($$render) => {
									if ($.get(emojis).length > 0) $$render(consequent_2);
								});
							}

							$.append($$anchor, fragment_9);
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}