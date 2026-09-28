import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command } from "bits-ui";
import Sticker from "phosphor-svelte/lib/Sticker";
import Smiley from "phosphor-svelte/lib/Smiley";
import ArrowLeft from "phosphor-svelte/lib/ArrowLeft";
import { Button } from "../ui/button/index.js";
import { cn } from "$lib/utils/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<div class="flex items-center"><!> <!></div> <!>`, 1);

export default function Command_grid_demo($$anchor, $$props) {
	$.push($$props, true);

	const defaultView = {
		columns: undefined,
		placeholder: "Search for something...",
		empty: "No results found.",
		groups: [
			{
				name: "Suggestions",
				items: [
					{
						content: "Search Emojis and Symbols",
						keywords: ["emoji", "symbols"],
						icon: Smiley,
						action: () => {
							$.set(search, "");
							views.push(emojiView);
						}
					}
				]
			}
		]
	};

	const emojiView = {
		columns: 8,
		placeholder: "Search Emoji and Symbols...",
		empty: "No emojis or symbols found.",
		groups: [
			{
				name: "Pinned",
				items: [
					{ content: "🤷‍♂️", keywords: ["shrug"] },
					{ content: "✅", keywords: ["check", "mark"] },
					{ content: "🎉", keywords: ["party"] }
				]
			},

			{
				name: "Frequently Used",
				items: [
					{ content: "¢", keywords: ["cent", "currency"] },
					{ content: "📦", keywords: ["box", "cardboard", "shipping"] },
					{ content: "🛜", keywords: ["wifi"] },
					{ content: "🔥", keywords: ["fire", "hot"] },
					{ content: "⭐", keywords: ["star", "favorite"] },
					{ content: "👍", keywords: ["thumbs up", "like", "approve"] },
					{ content: "🚀", keywords: ["rocket", "launch"] },
					{ content: "👏", keywords: ["clap", "applause"] }
				]
			},

			{
				name: "All Emojis",
				items: [
					{ content: "😊", keywords: ["smile", "happy", "face"] },
					{ content: "❤️", keywords: ["heart", "love"] },
					{ content: "👀", keywords: ["eyes", "look", "see"] },
					{ content: "💡", keywords: ["lightbulb", "idea"] },
					{ content: "☕", keywords: ["coffee", "drink", "break"] },
					{ content: "💻", keywords: ["computer", "laptop", "work"] },
					{ content: "✏️", keywords: ["pencil", "edit", "write"] },
					{ content: "📅", keywords: ["calendar", "date", "schedule"] },
					{ content: "📱", keywords: ["phone", "call", "mobile"] },
					{ content: "🎵", keywords: ["music", "note", "song"] },
					{ content: "📷", keywords: ["camera", "photo", "picture"] },
					{ content: "🎁", keywords: ["gift", "present", "surprise"] },
					{ content: "🌙", keywords: ["moon", "night", "sleep"] },
					{ content: "☀️", keywords: ["sun", "day", "weather"] },
					{ content: "🌈", keywords: ["rainbow", "color", "pride"] },
					{ content: "🌍", keywords: ["earth", "world", "globe"] },
					{ content: "🌳", keywords: ["tree", "nature", "plant"] },
					{ content: "🌸", keywords: ["flower", "nature", "spring"] },
					{
						content: "🎆",
						keywords: ["fireworks", "celebration", "festival"]
					},
					{ content: "🎈", keywords: ["balloon", "party", "birthday"] },
					{ content: "🍪", keywords: ["cookie", "snack", "dessert"] },
					{ content: "🍕", keywords: ["pizza", "food", "slice"] },
					{ content: "🍦", keywords: ["ice cream", "dessert", "sweet"] },
					{ content: "🍎", keywords: ["apple", "fruit", "food"] },
					{ content: "🍌", keywords: ["banana", "fruit", "yellow"] },
					{ content: "🚗", keywords: ["car", "vehicle", "drive"] },
					{ content: "🚲", keywords: ["bicycle", "bike", "ride"] },
					{ content: "🚆", keywords: ["train", "travel", "transport"] },
					{ content: "✈️", keywords: ["airplane", "flight", "travel"] },
					{ content: "⚓", keywords: ["anchor", "boat", "sea"] },
					{ content: "🏅", keywords: ["medal", "award", "winner"] },
					{ content: "⚽", keywords: ["soccer", "football", "sport"] },
					{ content: "🏀", keywords: ["basketball", "sport", "game"] },
					{ content: "🏆", keywords: ["trophy", "award", "win"] },
					{ content: "📚", keywords: ["book", "read", "study"] },
					{ content: "✉️", keywords: ["mail", "envelope", "letter"] },
					{ content: "🤩", keywords: ["star eyes", "excited", "wow"] },
					{ content: "🤔", keywords: ["thinking", "hmm", "question"] },
					{ content: "😴", keywords: ["sleepy", "tired", "zzz"] },
					{ content: "😢", keywords: ["cry", "sad", "tears"] },
					{ content: "😂", keywords: ["laugh", "joy", "funny"] },
					{ content: "😉", keywords: ["wink", "flirt", "smile"] },
					{ content: "🤓", keywords: ["nerd", "geek", "glasses"] },
					{ content: "🤖", keywords: ["robot", "ai", "machine"] },
					{ content: "👻", keywords: ["ghost", "spooky", "halloween"] },
					{ content: "👽", keywords: ["alien", "space", "ufo"] }
				]
			}
		]
	};

	const views = $.proxy([defaultView, emojiView]);
	const currentView = $.derived(() => views[views.length - 1]);
	let search = $.state("");

	function popView() {
		if (views.length > 1) {
			views.pop();
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Command.Root, ($$anchor, Command_Root) => {
		Command_Root($$anchor, {
			disableInitialScroll: true,
			get columns() {
				return $.get(currentView).columns;
			},
			class: 'divide-border border-muted bg-background flex h-full w-full flex-col divide-y self-start overflow-hidden rounded-xl border',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var div = $.first_child(fragment_1);
				var node_1 = $.child(div);

				{
					var consequent = ($$anchor) => {
						Button($$anchor, {
							variant: 'ghost',
							onclick: () => views.pop(),
							children: ($$anchor, $$slotProps) => {
								ArrowLeft($$anchor, {});
							},
							$$slots: { default: true }
						});
					};

					$.if(node_1, ($$render) => {
						if (views.length > 1) $$render(consequent);
					});
				}

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => cn("focus-override h-input placeholder:text-foreground-alt/50 bg-background focus:outline-hidden inline-flex flex-1 truncate rounded-tl-xl rounded-tr-xl pr-4 text-sm transition-colors focus:ring-0", { "pl-4": views.length === 1 }));

					$.component(node_2, () => Command.Input, ($$anchor, Command_Input) => {
						Command_Input($$anchor, {
							autofocus: false,
							get class() {
								return $.get($0);
							},

							onkeydown: (e) => {
								if (e.key === "Backspace" && $.get(search).length === 0) {
									e.preventDefault();
									popView();
								}
							},

							get placeholder() {
								return $.get(currentView).placeholder;
							},

							get value() {
								return $.get(search);
							},

							set value($$value) {
								$.set(search, $$value, true);
							}
						});
					});
				}

				$.reset(div);

				var node_3 = $.sibling(div, 2);

				{
					var consequent_2 = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_4 = $.first_child(fragment_4);

						$.component(node_4, () => Command.List, ($$anchor, Command_List) => {
							Command_List($$anchor, {
								class: 'max-h-[280px] overflow-y-auto overflow-x-hidden px-2 pb-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_5 = $.first_child(fragment_5);

									$.component(node_5, () => Command.Viewport, ($$anchor, Command_Viewport) => {
										Command_Viewport($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_6 = $.first_child(fragment_6);

												$.component(node_6, () => Command.Empty, ($$anchor, Command_Empty) => {
													Command_Empty($$anchor, {
														class: 'text-muted-foreground flex w-full items-center justify-center pb-6 pt-8 text-sm',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text();

															$.template_effect(() => $.set_text(text, $.get(currentView).empty));
															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_6, 2);

												$.each(node_7, 16, () => $.get(currentView).groups, (group) => group, ($$anchor, group) => {
													var fragment_8 = $.comment();
													var node_8 = $.first_child(fragment_8);

													$.component(node_8, () => Command.Group, ($$anchor, Command_Group) => {
														Command_Group($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = root();
																var node_9 = $.first_child(fragment_9);

																$.component(node_9, () => Command.GroupHeading, ($$anchor, Command_GroupHeading) => {
																	Command_GroupHeading($$anchor, {
																		class: 'text-muted-foreground px-2 pb-2 pt-4 text-xs',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text();

																			$.template_effect(() => $.set_text(text_1, group.name));
																			$.append($$anchor, text_1);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_10 = $.sibling(node_9, 2);

																$.component(node_10, () => Command.GroupItems, ($$anchor, Command_GroupItems) => {
																	Command_GroupItems($$anchor, {
																		class: 'grid grid-cols-8 gap-2 px-2',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_11 = $.comment();
																			var node_11 = $.first_child(fragment_11);

																			$.each(node_11, 16, () => group.items, (groupItem) => groupItem, ($$anchor, groupItem) => {
																				var fragment_12 = $.comment();
																				var node_12 = $.first_child(fragment_12);

																				$.component(node_12, () => Command.Item, ($$anchor, Command_Item) => {
																					Command_Item($$anchor, {
																						class: 'rounded-button bg-muted data-selected:ring-foreground outline-hidden flex aspect-square size-full cursor-pointer select-none items-center justify-center text-2xl ring-2 ring-transparent aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
																						get keywords() {
																							return groupItem.keywords;
																						},

																						get disabled() {
																							return groupItem.disabled;
																						},

																						children: ($$anchor, $$slotProps) => {
																							var fragment_13 = $.comment();
																							var node_13 = $.first_child(fragment_13);

																							{
																								var consequent_1 = ($$anchor) => {
																									var fragment_14 = $.comment();
																									var node_14 = $.first_child(fragment_14);

																									$.component(node_14, () => groupItem.icon, ($$anchor, groupItem_icon) => {
																										groupItem_icon($$anchor, { class: 'size-4' });
																									});

																									$.append($$anchor, fragment_14);
																								};

																								var alternate = ($$anchor) => {
																									var text_2 = $.text();

																									$.template_effect(() => $.set_text(text_2, groupItem.content));
																									$.append($$anchor, text_2);
																								};

																								$.if(node_13, ($$render) => {
																									if (groupItem.icon) $$render(consequent_1); else $$render(alternate, -1);
																								});
																							}

																							$.append($$anchor, fragment_13);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_12);
																			});

																			$.append($$anchor, fragment_11);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_9);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_8);
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

					var alternate_1 = ($$anchor) => {
						var fragment_16 = $.comment();
						var node_15 = $.first_child(fragment_16);

						$.component(node_15, () => Command.List, ($$anchor, Command_List_1) => {
							Command_List_1($$anchor, {
								class: 'max-h-[280px] overflow-y-auto overflow-x-hidden px-2 pb-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = $.comment();
									var node_16 = $.first_child(fragment_17);

									$.component(node_16, () => Command.Viewport, ($$anchor, Command_Viewport_1) => {
										Command_Viewport_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_18 = root();
												var node_17 = $.first_child(fragment_18);

												$.component(node_17, () => Command.Empty, ($$anchor, Command_Empty_1) => {
													Command_Empty_1($$anchor, {
														class: 'text-muted-foreground flex w-full items-center justify-center pb-6 pt-8 text-sm',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text();

															$.template_effect(() => $.set_text(text_3, $.get(currentView).empty));
															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_18 = $.sibling(node_17, 2);

												$.each(node_18, 16, () => $.get(currentView).groups, (group) => group, ($$anchor, group) => {
													var fragment_20 = $.comment();
													var node_19 = $.first_child(fragment_20);

													$.component(node_19, () => Command.Group, ($$anchor, Command_Group_1) => {
														Command_Group_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_21 = root();
																var node_20 = $.first_child(fragment_21);

																$.component(node_20, () => Command.GroupHeading, ($$anchor, Command_GroupHeading_1) => {
																	Command_GroupHeading_1($$anchor, {
																		class: 'text-muted-foreground px-3 pb-2 pt-4 text-xs',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text();

																			$.template_effect(() => $.set_text(text_4, group.name));
																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_21 = $.sibling(node_20, 2);

																$.component(node_21, () => Command.GroupItems, ($$anchor, Command_GroupItems_1) => {
																	Command_GroupItems_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_23 = $.comment();
																			var node_22 = $.first_child(fragment_23);

																			$.each(node_22, 16, () => group.items, (groupItem) => groupItem, ($$anchor, groupItem) => {
																				var fragment_24 = $.comment();
																				var node_23 = $.first_child(fragment_24);

																				$.component(node_23, () => Command.Item, ($$anchor, Command_Item_1) => {
																					Command_Item_1($$anchor, {
																						class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																						get keywords() {
																							return groupItem.keywords;
																						},

																						get disabled() {
																							return groupItem.disabled;
																						},

																						get onSelect() {
																							return groupItem.action;
																						},

																						children: ($$anchor, $$slotProps) => {
																							var fragment_25 = root_1();
																							var node_24 = $.first_child(fragment_25);

																							{
																								var consequent_3 = ($$anchor) => {
																									var fragment_26 = $.comment();
																									var node_25 = $.first_child(fragment_26);

																									$.component(node_25, () => groupItem.icon, ($$anchor, groupItem_icon_1) => {
																										groupItem_icon_1($$anchor, { class: 'size-4' });
																									});

																									$.append($$anchor, fragment_26);
																								};

																								$.if(node_24, ($$render) => {
																									if (groupItem.icon) $$render(consequent_3);
																								});
																							}

																							var text_5 = $.sibling(node_24);

																							$.template_effect(() => $.set_text(text_5, ` ${groupItem.content ?? ''}`));
																							$.append($$anchor, fragment_25);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_24);
																			});

																			$.append($$anchor, fragment_23);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_21);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_20);
												});

												$.append($$anchor, fragment_18);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_16);
					};

					$.if(node_3, ($$render) => {
						if ($.get(currentView).columns !== undefined) $$render(consequent_2); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}