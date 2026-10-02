import * as $ from 'svelte/internal/server';
import BookIcon from '@lucide/svelte/icons/book';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
import HashIcon from '@lucide/svelte/icons/hash';
import SearchIcon from '@lucide/svelte/icons/search';
import { Dialog, Portal, Combobox, useListCollection, useDialog } from '@skeletonlabs/skeleton-svelte';
import { prefetch } from 'astro:prefetch';
import { on } from 'svelte/events';

function result($$renderer, item) {
	{
		function element($$renderer, attributes) {
			$$renderer.push(`<a${$.attributes({ ...attributes, href: item.href })}>`);
			BookIcon($$renderer, { class: 'size-6 opacity-50' });
			$$renderer.push(`<!----> <div class="space-y-1">`);

			if (Combobox.ItemText) {
				$$renderer.push('<!--[-->');

				Combobox.ItemText($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(item.title)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <p class="text-xs">${$.escape(item.href)}</p></div> `);
			ChevronRightIcon($$renderer, { class: 'size-4 opacity-50' });
			$$renderer.push(`<!----></a>`);
		}

		if (Combobox.Item) {
			$$renderer.push('<!--[-->');

			Combobox.Item($$renderer, {
				class: 'p-2 grid grid-cols-[auto_1fr_auto] gap-4 items-center',
				item,
				element,
				$$slots: { element: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}
}

function subresult($$renderer, item) {
	{
		function element($$renderer, attributes) {
			$$renderer.push(`<a${$.attributes({ ...attributes, href: item.href })}><svg class="w-6 h-12 opacity-50" viewBox="0 0 24 54"><g stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v42M20 27H8.3"></path></g></svg> `);
			HashIcon($$renderer, { class: 'size-4 opacity-50' });
			$$renderer.push(`<!----> <div class="space-y-1">`);

			if (Combobox.ItemText) {
				$$renderer.push('<!--[-->');

				Combobox.ItemText($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(item.title)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <p class="text-xs text-surface-600-400 wrap-break-word [&amp;>mark]:mark">${$.html(item.excerpt)}</p></div> `);
			ChevronRightIcon($$renderer, { class: 'size-4 opacity-50' });
			$$renderer.push(`<!----></a>`);
		}

		if (Combobox.Item) {
			$$renderer.push('<!--[-->');

			Combobox.Item($$renderer, {
				class: 'p-2 grid grid-cols-[auto_auto_1fr_auto] gap-4 items-center',
				item,
				element,
				$$slots: { element: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}
}

export default function Search($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const // @ts-expect-error pagefind is only present during runtime
		id = $.props_id($$renderer);

		const { activeFramework } = $$props;
		const search = { query: '', status: 'idle', items: [] };

		const pagefindPromise = new Promise((resolve) => (async () => {
			if (import.meta.env.SSR) {
				return;
			}

			// @ts-expect-error pagefind is only present during runtime
			const pagefind = await import('/pagefind/pagefind.js');

			await pagefind.options({ excerptLength: 3, ranking: { termFrequency: 0 } });
			await pagefind.init();
			resolve(pagefind);
		})());

		const dialog = useDialog({
			id,
			onOpenChange(open) {
				if (!open) {
					return;
				}

				search.query = '';
			}
		});

		const collection = $.derived(() => useListCollection({
			items: search.items,
			itemToString: (item) => item.title,
			itemToValue: (item) => item.href
		}));

		const onInputValueChange = async (details) => {
			search.query = details.inputValue.trim();

			if (search.query.length === 0) {
				search.status = 'idle';

				return [];
			}

			search.status = 'searching';

			const pagefind = await pagefindPromise;
			const searchResult = await pagefind.debouncedSearch(search.query, {}, 200);

			// A more recent search call was made
			if (!searchResult) {
				return [];
			}

			search.items = (await Promise.all(searchResult.results.map(async (searchResult) => {
				const result = await searchResult.data();

				return [
					{
						type: 'result',
						href: result.url,
						title: result.meta.title,
						excerpt: result.excerpt
					},

					...result.sub_results.filter((subResult) => subResult.url !== result.url).map((subResult) => ({
						type: 'subresult',
						href: subResult.url,
						title: subResult.title,
						excerpt: subResult.excerpt
					}))
				];
			}))).flat().filter((item) => {
				if (item.href.startsWith('/docs/')) {
					return item.href.startsWith(`/docs/${activeFramework.id}/`);
				}

				return true;
			});

			if (search.query.length === 0) {
				search.status = 'idle';

				return [];
			}

			search.status = search.items.length === 0 ? 'no-results' : 'results';
		};

		const onValueChange = () => {
			dialog().setOpen(false);
		};

		const onHighlightChange = async (details) => {
			const url = details.highlightedValue;

			if (!url) {
				return;
			}

			prefetch(url);
		};

		if (Dialog.Provider) {
			$$renderer.push('<!--[-->');

			Dialog.Provider($$renderer, {
				value: dialog,
				children: ($$renderer) => {
					if (Dialog.Trigger) {
						$$renderer.push('<!--[-->');

						Dialog.Trigger($$renderer, {
							class: 'btn preset-tonal justify-start',
							children: ($$renderer) => {
								SearchIcon($$renderer, { class: 'size-4 opacity-60' });
								$$renderer.push(`<!----> <span class="opacity-60">Search...</span> <span class="badge preset-outlined-surface-500 hidden md:flex opacity-60 scale-90">⌘ K</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					Portal($$renderer, {
						children: ($$renderer) => {
							if (Dialog.Backdrop) {
								$$renderer.push('<!--[-->');

								Dialog.Backdrop($$renderer, {
									class: 'fixed inset-0 z-50 bg-surface-50-950/50 backdrop-blur-[2px]'
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Dialog.Positioner) {
								$$renderer.push('<!--[-->');

								Dialog.Positioner($$renderer, {
									class: 'fixed inset-0 z-50 flex justify-center items-start mt-[5%] p-4',
									children: ($$renderer) => {
										if (Dialog.Content) {
											$$renderer.push('<!--[-->');

											Dialog.Content($$renderer, {
												class: 'card bg-surface-50-950/90 backdrop-blur-sm border border-surface-200-800 w-full max-w-[960px] space-y-4 shadow-[0_0_100px_rgba(0,0,0,0.25)] shadow-primary-500/50 transition transition-discrete duration-200 opacity-0 starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100 motion-reduce:transition-none',
												children: ($$renderer) => {
													Combobox($$renderer, {
														class: 'w-full flex flex-col',
														placeholder: 'Search...',
														collection: collection(),
														inputValue: search.query,
														onInputValueChange,
														onValueChange,
														onHighlightChange,
														inputBehavior: 'autohighlight',
														selectionBehavior: 'preserve',
														open: dialog().open,
														children: ($$renderer) => {
															$$renderer.push(`<div class="px-4 pt-4 pb-4 lg:pb-2">`);

															if (Combobox.Control) {
																$$renderer.push('<!--[-->');

																Combobox.Control($$renderer, {
																	class: 'field-group grid-cols-[auto_1fr]',
																	children: ($$renderer) => {
																		$$renderer.push(`<label class="label preset-tonal" title="search" aria-label="search">`);
																		SearchIcon($$renderer, { class: 'size-4' });
																		$$renderer.push(`<!----></label> `);

																		if (Combobox.Input) {
																			$$renderer.push('<!--[-->');
																			Combobox.Input($$renderer, { class: 'input rounded-s-none', type: 'search' });
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

															$$renderer.push(`</div> <hr class="hr"/> `);

															if (search.status === 'idle') {
																$$renderer.push(`<!--[0--><span class="py-10 text-center opacity-50">What can we help you find?</span>`);
															} else if (search.status === 'searching') {
																$$renderer.push(`<!--[1--><span class="py-10 text-center opacity-50">Searching...</span>`);
															} else if (search.status === 'no-results') {
																$$renderer.push(`<!--[2--><span class="py-10 text-center opacity-50">No results found for <code class="code">${$.escape(search.query)}</code></span>`);
															} else if (search.status === 'results') {
																$$renderer.push('<!--[3-->');

																if (Combobox.Content) {
																	$$renderer.push('<!--[-->');

																	Combobox.Content($$renderer, {
																		class: 'relative px-4 py-2 border-none bg-transparent max-h-[50dvh] overflow-y-auto',
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array = $.ensure_array_like(collection().items);

																			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																				let item = each_array[$$index];

																				if (item.type === 'result') {
																					$$renderer.push('<!--[0-->');
																					result($$renderer, item);
																				} else if (item.type === 'subresult') {
																					$$renderer.push('<!--[1-->');
																					subresult($$renderer, item);
																				} else {
																					$$renderer.push('<!--[-1-->');
																				}

																				$$renderer.push(`<!--]-->`);
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
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--> <hr class="hidden lg:block hr"/> <div class="hidden lg:flex gap-2 px-4 pb-4 pt-2"><span class="text-sm opacity-50"><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> Navigate</span> <span class="text-sm opacity-50"><kbd class="kbd">⏎</kbd> Select</span> <span class="text-sm opacity-50"><kbd class="kbd">Esc</kbd> Close</span></div>`);
														},
														$$slots: { default: true }
													});
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

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}