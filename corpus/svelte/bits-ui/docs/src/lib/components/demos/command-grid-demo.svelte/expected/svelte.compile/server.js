import * as $ from 'svelte/internal/server';
import { Command } from "bits-ui";
import Sticker from "phosphor-svelte/lib/Sticker";
import Smiley from "phosphor-svelte/lib/Smiley";
import ArrowLeft from "phosphor-svelte/lib/ArrowLeft";
import { Button } from "../ui/button/index.js";
import { cn } from "$lib/utils/index.js";

export default function Command_grid_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
								search = "";
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

		const views = [defaultView, emojiView];
		const currentView = $.derived(() => views[views.length - 1]);
		let search = "";

		function popView() {
			if (views.length > 1) {
				views.pop();
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Command.Root) {
				$$renderer.push('<!--[-->');

				Command.Root($$renderer, {
					disableInitialScroll: true,
					columns: currentView().columns,
					class: 'divide-border border-muted bg-background flex h-full w-full flex-col divide-y self-start overflow-hidden rounded-xl border',
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex items-center">`);

						if (views.length > 1) {
							$$renderer.push('<!--[0-->');

							Button($$renderer, {
								variant: 'ghost',
								onclick: () => views.pop(),
								children: ($$renderer) => {
									ArrowLeft($$renderer, {});
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (Command.Input) {
							$$renderer.push('<!--[-->');

							Command.Input($$renderer, {
								autofocus: false,
								class: cn("focus-override h-input placeholder:text-foreground-alt/50 bg-background focus:outline-hidden inline-flex flex-1 truncate rounded-tl-xl rounded-tr-xl pr-4 text-sm transition-colors focus:ring-0", { "pl-4": views.length === 1 }),
								onkeydown: (e) => {
									if (e.key === "Backspace" && search.length === 0) {
										e.preventDefault();
										popView();
									}
								},
								placeholder: currentView().placeholder,
								get value() {
									return search;
								},

								set value($$value) {
									search = $$value;
									$$settled = false;
								}
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div> `);

						if (currentView().columns !== undefined) {
							$$renderer.push('<!--[0-->');

							if (Command.List) {
								$$renderer.push('<!--[-->');

								Command.List($$renderer, {
									class: 'max-h-[280px] overflow-y-auto overflow-x-hidden px-2 pb-2',
									children: ($$renderer) => {
										if (Command.Viewport) {
											$$renderer.push('<!--[-->');

											Command.Viewport($$renderer, {
												children: ($$renderer) => {
													if (Command.Empty) {
														$$renderer.push('<!--[-->');

														Command.Empty($$renderer, {
															class: 'text-muted-foreground flex w-full items-center justify-center pb-6 pt-8 text-sm',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(currentView().empty)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` <!--[-->`);

													const each_array = $.ensure_array_like(currentView().groups);

													for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
														let group = each_array[$$index_1];

														if (Command.Group) {
															$$renderer.push('<!--[-->');

															Command.Group($$renderer, {
																children: ($$renderer) => {
																	if (Command.GroupHeading) {
																		$$renderer.push('<!--[-->');

																		Command.GroupHeading($$renderer, {
																			class: 'text-muted-foreground px-2 pb-2 pt-4 text-xs',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(group.name)}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Command.GroupItems) {
																		$$renderer.push('<!--[-->');

																		Command.GroupItems($$renderer, {
																			class: 'grid grid-cols-8 gap-2 px-2',
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array_1 = $.ensure_array_like(group.items);

																				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																					let groupItem = each_array_1[$$index];

																					if (Command.Item) {
																						$$renderer.push('<!--[-->');

																						Command.Item($$renderer, {
																							class: 'rounded-button bg-muted data-selected:ring-foreground outline-hidden flex aspect-square size-full cursor-pointer select-none items-center justify-center text-2xl ring-2 ring-transparent aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
																							keywords: groupItem.keywords,
																							disabled: groupItem.disabled,
																							children: ($$renderer) => {
																								if (groupItem.icon) {
																									$$renderer.push('<!--[0-->');

																									if (groupItem.icon) {
																										$$renderer.push('<!--[-->');
																										groupItem.icon($$renderer, { class: 'size-4' });
																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}
																								} else {
																									$$renderer.push(`<!--[-1-->${$.escape(groupItem.content)}`);
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

							if (Command.List) {
								$$renderer.push('<!--[-->');

								Command.List($$renderer, {
									class: 'max-h-[280px] overflow-y-auto overflow-x-hidden px-2 pb-2',
									children: ($$renderer) => {
										if (Command.Viewport) {
											$$renderer.push('<!--[-->');

											Command.Viewport($$renderer, {
												children: ($$renderer) => {
													if (Command.Empty) {
														$$renderer.push('<!--[-->');

														Command.Empty($$renderer, {
															class: 'text-muted-foreground flex w-full items-center justify-center pb-6 pt-8 text-sm',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(currentView().empty)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` <!--[-->`);

													const each_array_2 = $.ensure_array_like(currentView().groups);

													for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
														let group = each_array_2[$$index_3];

														if (Command.Group) {
															$$renderer.push('<!--[-->');

															Command.Group($$renderer, {
																children: ($$renderer) => {
																	if (Command.GroupHeading) {
																		$$renderer.push('<!--[-->');

																		Command.GroupHeading($$renderer, {
																			class: 'text-muted-foreground px-3 pb-2 pt-4 text-xs',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(group.name)}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Command.GroupItems) {
																		$$renderer.push('<!--[-->');

																		Command.GroupItems($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array_3 = $.ensure_array_like(group.items);

																				for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
																					let groupItem = each_array_3[$$index_2];

																					if (Command.Item) {
																						$$renderer.push('<!--[-->');

																						Command.Item($$renderer, {
																							class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																							keywords: groupItem.keywords,
																							disabled: groupItem.disabled,
																							onSelect: groupItem.action,
																							children: ($$renderer) => {
																								if (groupItem.icon) {
																									$$renderer.push('<!--[0-->');

																									if (groupItem.icon) {
																										$$renderer.push('<!--[-->');
																										groupItem.icon($$renderer, { class: 'size-4' });
																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}
																								} else {
																									$$renderer.push('<!--[-1-->');
																								}

																								$$renderer.push(`<!--]--> ${$.escape(groupItem.content)}`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}