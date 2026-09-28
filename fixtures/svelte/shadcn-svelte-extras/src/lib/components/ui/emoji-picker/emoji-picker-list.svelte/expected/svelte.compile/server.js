import * as $ from 'svelte/internal/server';
import * as Command from '$lib/components/ui/command';
import { Command as CommandPrimitive } from 'bits-ui';
import data from '@emoji-mart/data';
import * as casing from '$lib/utils/casing';
import { makeValue, parseValue, useEmojiPickerList } from './emoji-picker.svelte.js';
import { cn } from '$lib/utils.js';

export default function Emoji_picker_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			emptyMessage = 'No results.',
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

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
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Command.List) {
				$$renderer.push('<!--[-->');

				Command.List($$renderer, $.spread_props([
					{ class: cn('relative h-[200px]', className) },
					rest,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Command.Empty) {
								$$renderer.push('<!--[-->');

								Command.Empty($$renderer, {
									class: 'absolute inset-0 flex place-items-center justify-center py-0',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(emptyMessage)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (pickerState.showRecents) {
								$$renderer.push('<!--[0-->');

								const recents = pickerState.root.frecency?.items.filter((item) => {
									const { name } = parseValue(item);

									return filter(pickerState.root.emojiPickerState.search, emojiData.emojis[name].keywords);
								}).slice(0, pickerState.maxRecents);

								if (recents && recents.length > 0) {
									$$renderer.push('<!--[0-->');

									if (CommandPrimitive.Group) {
										$$renderer.push('<!--[-->');

										CommandPrimitive.Group($$renderer, {
											children: ($$renderer) => {
												if (CommandPrimitive.GroupHeading) {
													$$renderer.push('<!--[-->');

													CommandPrimitive.GroupHeading($$renderer, {
														class: 'text-muted-foreground px-2 py-1 text-xs',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Recents`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (CommandPrimitive.GroupItems) {
													$$renderer.push('<!--[-->');

													CommandPrimitive.GroupItems($$renderer, {
														class: 'grid grid-cols-6 px-2',
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(recents);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let item = each_array[$$index];
																const { name, skin } = parseValue(item);
																const emoji = emojiData.emojis[name].skins[skin].native;

																if (Command.Item) {
																	$$renderer.push('<!--[-->');

																	Command.Item($$renderer, {
																		class: 'flex aspect-square size-9 place-items-center justify-center text-lg [&_svg]:hidden!',
																		value: `${$.stringify(item)}:recent`,
																		onSelect: () => {
																			pickerState.select(item);
																			pickerState.root.frecency?.use(item);
																		},

																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(emoji)}`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
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
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <!--[-->`);

							const each_array_1 = $.ensure_array_like(emojiData.categories);

							for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
								let category = each_array_1[$$index_2];
								const emojis = category.emojis.filter((item) => filter(pickerState.root.emojiPickerState.search, emojiData.emojis[item].keywords));

								if (emojis.length > 0) {
									$$renderer.push('<!--[0-->');

									if (CommandPrimitive.Group) {
										$$renderer.push('<!--[-->');

										CommandPrimitive.Group($$renderer, {
											children: ($$renderer) => {
												if (CommandPrimitive.GroupHeading) {
													$$renderer.push('<!--[-->');

													CommandPrimitive.GroupHeading($$renderer, {
														class: 'text-muted-foreground px-2 py-1 text-xs',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(casing.camelToPascal(category.id))}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (CommandPrimitive.GroupItems) {
													$$renderer.push('<!--[-->');

													CommandPrimitive.GroupItems($$renderer, {
														class: 'grid grid-cols-6 px-2',
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_2 = $.ensure_array_like(emojis);

															for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
																let item = each_array_2[$$index_1];
																const emoji = emojiData.emojis[item];
																const emojiSkin = emoji.skins.length > 1 ? pickerState.skinIndex : 0;
																const key = makeValue(item, emojiSkin);

																if (Command.Item) {
																	$$renderer.push('<!--[-->');

																	Command.Item($$renderer, {
																		class: 'flex aspect-square size-9 place-items-center justify-center text-lg [&_svg]:hidden!',
																		value: item,
																		onSelect: () => {
																			pickerState.select(key);
																			pickerState.root.frecency?.use(key);
																		},

																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(emoji.skins[emojiSkin].native)}`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
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
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}