import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlass";
import { onMount } from "svelte";
import { Button, Command, Dialog } from "bits-ui";
import { createContentIndex, searchContentIndex } from "$lib/utils/search.js";
import ScrollArea from "./ui/scroll-area.svelte";

var root = $.from_html(`<span class="flex items-center gap-2"><!>Search Docs ...</span> <span class="flex items-center gap-[1px]"><kbd class="bg-background-alt shadow-kbd dark:bg-dark-10 pointer-events-none hidden h-5 select-none items-center gap-1 rounded-sm border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex dark:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.07)]"><span class="text-xs">⌘</span></kbd> <kbd class="bg-background-alt shadow-kbd dark:bg-dark-10 pointer-events-none hidden h-5 select-none items-center gap-1 rounded-sm border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex dark:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.07)]">K</kbd></span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span class="text-muted-foreground text-xs"> </span>`);
var root_3 = $.from_html(`<div class="search-result text-muted-foreground text-xs leading-relaxed"></div>`);
var root_4 = $.from_html(`<div class="flex w-full items-center justify-between"><span class="font-medium capitalize"> </span> <!></div> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);

export default function Search($$anchor, $$props) {
	$.push($$props, true);

	let showTrigger = $.prop($$props, 'showTrigger', 3, true),
		open = $.prop($$props, 'open', 15, false);

	let searchState = $.state("loading");
	let searchQuery = $.state("");
	let results = $.state($.proxy([]));

	onMount(async () => {
		const content = await fetch("/api/search.json").then((res) => res.json());

		createContentIndex(content);
		$.set(searchState, "ready");
	});

	$.user_effect(() => {
		if ($.get(searchState) !== "ready") return;

		$.set(results, searchContentIndex($.get(searchQuery)), true);
	});

	let clearTimeoutId;

	function handleKeydown(e) {
		if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open(true);
		}
	}

	function clearSearchWithDelay() {
		if (clearTimeoutId) window.clearTimeout(clearTimeoutId);

		clearTimeoutId = window.setTimeout(
			() => {
				$.set(searchQuery, "");
				clearTimeoutId = undefined;
			},
			300
		);
	}

	var fragment = $.comment();

	$.event('keydown', $.document, handleKeydown);

	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			onOpenChange: (o) => {
				if (o) return;

				clearSearchWithDelay();
			},

			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = root_1();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Button.Root, ($$anchor, Button_Root) => {
							Button_Root($$anchor, {
								onclick: () => open(true),
								'aria-label': 'Search Docs',
								class: 'rounded-input hover:bg-dark-10 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden relative -mr-3 ml-auto inline-flex h-10 w-10 touch-manipulation items-center justify-center px-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 sm:hidden',
								children: ($$anchor, $$slotProps) => {
									MagnifyingGlass($$anchor, { class: 'size-5' });
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
							Dialog_Trigger($$anchor, {
								class: 'bg-muted text-muted-foreground ring-offset-background hover:bg-dark-10 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden relative hidden h-10 items-center justify-between gap-3 whitespace-nowrap rounded-[9px] px-3 text-sm font-normal transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 sm:inline-flex sm:w-72',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var span = $.first_child(fragment_4);
									var node_4 = $.child(span);

									MagnifyingGlass(node_4, { class: 'size-5' });
									$.next();
									$.reset(span);
									$.next(2);
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					};

					$.if(node_1, ($$render) => {
						if (showTrigger()) $$render(consequent);
					});
				}

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Dialog.Portal, ($$anchor, Dialog_Portal) => {
					Dialog_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_6 = $.first_child(fragment_5);

							$.component(node_6, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
								Dialog_Overlay($$anchor, {
									class: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80'
								});
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => Dialog.Content, ($$anchor, Dialog_Content) => {
								Dialog_Content($$anchor, {
									class: 'rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-100 outline-hidden duration-400 fixed left-[50%] top-[20%] w-full max-w-[94%] translate-x-[-50%] translate-y-[0%] ease-out sm:max-w-[600px] md:w-full',
									onCloseAutoFocus: (e) => {
										e.preventDefault();
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_5();
										var node_8 = $.first_child(fragment_6);

										$.component(node_8, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'sr-only',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Search');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												class: 'sr-only',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Search for documentation');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_9, 2);

										$.component(node_10, () => Command.Root, ($$anchor, Command_Root) => {
											Command_Root($$anchor, {
												shouldFilter: false,
												class: 'bg-background flex h-full w-full flex-col self-start overflow-hidden rounded-xl',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_5();
													var node_11 = $.first_child(fragment_7);

													{
														let $0 = $.derived(() => $.get(searchQuery) === "");

														$.component(node_11, () => Command.Input, ($$anchor, Command_Input) => {
															Command_Input($$anchor, {
																autocomplete: 'off',
																spellcheck: 'false',
																type: 'search',
																get 'data-empty'() {
																	return $.get($0);
																},
																class: 'focus-override h-input bg-background placeholder:text-foreground-alt/50 focus:outline-hidden inline-flex w-full touch-manipulation truncate rounded-xl px-4 text-base transition-colors focus:ring-0 data-[empty=false]:rounded-b-none data-[empty=false]:border-b',
																placeholder: 'Search for something...',
																get value() {
																	return $.get(searchQuery);
																},

																set value($$value) {
																	$.set(searchQuery, $$value, true);
																}
															});
														});
													}

													var node_12 = $.sibling(node_11, 2);

													{
														var consequent_1 = ($$anchor) => {
															var fragment_8 = $.comment();
															var node_13 = $.first_child(fragment_8);

															$.component(node_13, () => Command.Empty, ($$anchor, Command_Empty) => {
																Command_Empty($$anchor, {
																	forceMount: true,
																	class: 'text-foreground flex w-full items-center justify-center pb-6 pt-8 text-sm',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('No results found.');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_8);
														};

														$.if(node_12, ($$render) => {
															if ($.get(searchQuery) !== "" && $.get(results).length === 0) $$render(consequent_1);
														});
													}

													var node_14 = $.sibling(node_12, 2);

													{
														var consequent_5 = ($$anchor) => {
															var fragment_9 = $.comment();
															var node_15 = $.first_child(fragment_9);

															{
																const child = ($$anchor, $$arg0) => {
																	let props = () => ($$arg0?.()).props;

																	ScrollArea($$anchor, $.spread_props(props, {
																		type: 'auto',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_11 = $.comment();
																			var node_16 = $.first_child(fragment_11);

																			$.component(node_16, () => Command.Viewport, ($$anchor, Command_Viewport) => {
																				Command_Viewport($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_12 = root_1();
																						var node_17 = $.first_child(fragment_12);

																						{
																							var consequent_2 = ($$anchor) => {
																								var fragment_13 = $.comment();
																								var node_18 = $.first_child(fragment_13);

																								$.component(node_18, () => Command.Loading, ($$anchor, Command_Loading) => {
																									Command_Loading($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_3 = $.text('Loading...');

																											$.append($$anchor, text_3);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_13);
																							};

																							$.if(node_17, ($$render) => {
																								if ($.get(searchState) === "loading") $$render(consequent_2);
																							});
																						}

																						var node_19 = $.sibling(node_17, 2);

																						$.each(node_19, 17, () => $.get(results), ({ title, href, snippet, category }) => title + href, ($$anchor, $$item) => {
																							let title = () => $.get($$item).title;
																							let href = () => $.get($$item).href;
																							let snippet = () => $.get($$item).snippet;
																							let category = () => $.get($$item).category;
																							var fragment_14 = $.comment();
																							var node_20 = $.first_child(fragment_14);

																							$.component(node_20, () => Command.LinkItem, ($$anchor, Command_LinkItem) => {
																								Command_LinkItem($$anchor, {
																									get href() {
																										return href();
																									},
																									class: 'rounded-button data-selected:bg-muted outline-hidden flex cursor-pointer select-none flex-col items-start gap-1 px-3 py-2.5 text-sm',
																									onSelect: () => {
																										$.set(searchQuery, "");
																										open(false);
																									},

																									children: ($$anchor, $$slotProps) => {
																										var fragment_15 = root_4();
																										var div = $.first_child(fragment_15);
																										var span_1 = $.child(div);
																										var text_4 = $.only_child(span_1, true);
																										var node_21 = $.sibling(span_1, 2);

																										{
																											var consequent_3 = ($$anchor) => {
																												var span_2 = root_2();
																												var text_5 = $.only_child(span_2, true);

																												$.template_effect(() => $.set_text(text_5, category()));
																												$.append($$anchor, span_2);
																											};

																											$.if(node_21, ($$render) => {
																												if (category()) $$render(consequent_3);
																											});
																										}

																										$.reset(div);

																										var node_22 = $.sibling(div, 2);

																										{
																											var consequent_4 = ($$anchor) => {
																												var div_1 = root_3();

																												$.html(div_1, snippet, true);
																												$.reset(div_1);
																												$.append($$anchor, div_1);
																											};

																											$.if(node_22, ($$render) => {
																												if (snippet()) $$render(consequent_4);
																											});
																										}

																										$.template_effect(() => $.set_text(text_4, title()));
																										$.append($$anchor, fragment_15);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_14);
																						});

																						$.append($$anchor, fragment_12);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_11);
																		},
																		$$slots: { default: true }
																	}));
																};

																$.component(node_15, () => Command.List, ($$anchor, Command_List) => {
																	Command_List($$anchor, {
																		class: 'mt-1 max-h-[400px] overflow-x-hidden px-2 pb-2 pt-2',
																		child,
																		$$slots: { child: true }
																	});
																});
															}

															$.append($$anchor, fragment_9);
														};

														$.if(node_14, ($$render) => {
															if ($.get(searchQuery) !== "" && $.get(results).length > 0) $$render(consequent_5);
														});
													}

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

							$.append($$anchor, fragment_5);
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