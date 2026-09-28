import * as $ from 'svelte/internal/server';
import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlass";
import { onMount } from "svelte";
import { Button, Command, Dialog } from "bits-ui";
import { createContentIndex, searchContentIndex } from "$lib/utils/search.js";
import ScrollArea from "./ui/scroll-area.svelte";

export default function Search($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { showTrigger = true, open = false } = $$props;
		let searchState = "loading";
		let searchQuery = "";
		let results = [];

		onMount(async () => {
			const content = await fetch("/api/search.json").then((res) => res.json());

			createContentIndex(content);
			searchState = "ready";
		});

		let clearTimeoutId;

		function handleKeydown(e) {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = true;
			}
		}

		function clearSearchWithDelay() {
			if (clearTimeoutId) window.clearTimeout(clearTimeoutId);

			clearTimeoutId = window.setTimeout(
				() => {
					searchQuery = "";
					clearTimeoutId = undefined;
				},
				300
			);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					onOpenChange: (o) => {
						if (o) return;

						clearSearchWithDelay();
					},

					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (showTrigger) {
							$$renderer.push('<!--[0-->');

							if (Button.Root) {
								$$renderer.push('<!--[-->');

								Button.Root($$renderer, {
									onclick: () => open = true,
									'aria-label': 'Search Docs',
									class: 'rounded-input hover:bg-dark-10 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden relative -mr-3 ml-auto inline-flex h-10 w-10 touch-manipulation items-center justify-center px-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 sm:hidden',
									children: ($$renderer) => {
										MagnifyingGlass($$renderer, { class: 'size-5' });
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Dialog.Trigger) {
								$$renderer.push('<!--[-->');

								Dialog.Trigger($$renderer, {
									class: 'bg-muted text-muted-foreground ring-offset-background hover:bg-dark-10 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden relative hidden h-10 items-center justify-between gap-3 whitespace-nowrap rounded-[9px] px-3 text-sm font-normal transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 sm:inline-flex sm:w-72',
									children: ($$renderer) => {
										$$renderer.push(`<span class="flex items-center gap-2">`);
										MagnifyingGlass($$renderer, { class: 'size-5' });
										$$renderer.push(`<!---->Search Docs ...</span> <span class="flex items-center gap-[1px]"><kbd class="bg-background-alt shadow-kbd dark:bg-dark-10 pointer-events-none hidden h-5 select-none items-center gap-1 rounded-sm border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex dark:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.07)]"><span class="text-xs">⌘</span></kbd> <kbd class="bg-background-alt shadow-kbd dark:bg-dark-10 pointer-events-none hidden h-5 select-none items-center gap-1 rounded-sm border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex dark:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.07)]">K</kbd></span>`);
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

						$$renderer.push(`<!--]--> `);

						if (Dialog.Portal) {
							$$renderer.push('<!--[-->');

							Dialog.Portal($$renderer, {
								children: ($$renderer) => {
									if (Dialog.Overlay) {
										$$renderer.push('<!--[-->');

										Dialog.Overlay($$renderer, {
											class: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Dialog.Content) {
										$$renderer.push('<!--[-->');

										Dialog.Content($$renderer, {
											class: 'rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-100 outline-hidden duration-400 fixed left-[50%] top-[20%] w-full max-w-[94%] translate-x-[-50%] translate-y-[0%] ease-out sm:max-w-[600px] md:w-full',
											onCloseAutoFocus: (e) => {
												e.preventDefault();
											},

											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														class: 'sr-only',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Search`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														class: 'sr-only',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Search for documentation`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Command.Root) {
													$$renderer.push('<!--[-->');

													Command.Root($$renderer, {
														shouldFilter: false,
														class: 'bg-background flex h-full w-full flex-col self-start overflow-hidden rounded-xl',
														children: ($$renderer) => {
															if (Command.Input) {
																$$renderer.push('<!--[-->');

																Command.Input($$renderer, {
																	autocomplete: 'off',
																	spellcheck: 'false',
																	type: 'search',
																	'data-empty': searchQuery === "",
																	class: 'focus-override h-input bg-background placeholder:text-foreground-alt/50 focus:outline-hidden inline-flex w-full touch-manipulation truncate rounded-xl px-4 text-base transition-colors focus:ring-0 data-[empty=false]:rounded-b-none data-[empty=false]:border-b',
																	placeholder: 'Search for something...',
																	get value() {
																		return searchQuery;
																	},

																	set value($$value) {
																		searchQuery = $$value;
																		$$settled = false;
																	}
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (searchQuery !== "" && results.length === 0) {
																$$renderer.push('<!--[0-->');

																if (Command.Empty) {
																	$$renderer.push('<!--[-->');

																	Command.Empty($$renderer, {
																		forceMount: true,
																		class: 'text-foreground flex w-full items-center justify-center pb-6 pt-8 text-sm',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->No results found.`);
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

															$$renderer.push(`<!--]--> `);

															if (searchQuery !== "" && results.length > 0) {
																$$renderer.push('<!--[0-->');

																{
																	function child($$renderer, { props }) {
																		ScrollArea($$renderer, $.spread_props([
																			props,
																			{
																				type: 'auto',
																				children: ($$renderer) => {
																					if (Command.Viewport) {
																						$$renderer.push('<!--[-->');

																						Command.Viewport($$renderer, {
																							children: ($$renderer) => {
																								if (searchState === "loading") {
																									$$renderer.push('<!--[0-->');

																									if (Command.Loading) {
																										$$renderer.push('<!--[-->');

																										Command.Loading($$renderer, {
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->Loading...`);
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

																								$$renderer.push(`<!--]--> <!--[-->`);

																								const each_array = $.ensure_array_like(results);

																								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																									let { title, href, snippet, category } = each_array[$$index];

																									if (Command.LinkItem) {
																										$$renderer.push('<!--[-->');

																										Command.LinkItem($$renderer, {
																											href,
																											class: 'rounded-button data-selected:bg-muted outline-hidden flex cursor-pointer select-none flex-col items-start gap-1 px-3 py-2.5 text-sm',
																											onSelect: () => {
																												searchQuery = "";
																												open = false;
																											},

																											children: ($$renderer) => {
																												$$renderer.push(`<div class="flex w-full items-center justify-between"><span class="font-medium capitalize">${$.escape(title)}</span> `);

																												if (category) {
																													$$renderer.push(`<!--[0--><span class="text-muted-foreground text-xs">${$.escape(category)}</span>`);
																												} else {
																													$$renderer.push('<!--[-1-->');
																												}

																												$$renderer.push(`<!--]--></div> `);

																												if (snippet) {
																													$$renderer.push(`<!--[0--><div class="search-result text-muted-foreground text-xs leading-relaxed">${$.html(snippet)}</div>`);
																												} else {
																													$$renderer.push('<!--[-1-->');
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
																			}
																		]));
																	}

																	if (Command.List) {
																		$$renderer.push('<!--[-->');

																		Command.List($$renderer, {
																			class: 'mt-1 max-h-[400px] overflow-x-hidden px-2 pb-2 pt-2',
																			child,
																			$$slots: { child: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																}
															} else {
																$$renderer.push('<!--[-1-->');
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { open });
	});
}