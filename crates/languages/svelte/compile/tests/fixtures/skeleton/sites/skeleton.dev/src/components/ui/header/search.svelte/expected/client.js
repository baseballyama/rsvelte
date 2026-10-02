import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BookIcon from '@lucide/svelte/icons/book';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
import HashIcon from '@lucide/svelte/icons/hash';
import SearchIcon from '@lucide/svelte/icons/search';
import { Dialog, Portal, Combobox, useListCollection, useDialog } from '@skeletonlabs/skeleton-svelte';
import { prefetch } from 'astro:prefetch';
import { on } from 'svelte/events';

const result = ($$anchor, item = $.noop) => {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const element = ($$anchor, attributes = $.noop) => {
			var a = root();

			$.attribute_effect(a, () => ({ ...attributes(), href: item().href }));

			var node_1 = $.child(a);

			BookIcon(node_1, { class: 'size-6 opacity-50' });

			var div = $.sibling(node_1, 2);
			var node_2 = $.child(div);

			$.component(node_2, () => Combobox.ItemText, ($$anchor, Combobox_ItemText) => {
				Combobox_ItemText($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, item().title));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var p = $.sibling(node_2, 2);
			var text_1 = $.only_child(p, true);

			$.reset(div);

			var node_3 = $.sibling(div, 2);

			ChevronRightIcon(node_3, { class: 'size-4 opacity-50' });
			$.reset(a);
			$.template_effect(() => $.set_text(text_1, item().href));
			$.append($$anchor, a);
		};

		$.component(node, () => Combobox.Item, ($$anchor, Combobox_Item) => {
			Combobox_Item($$anchor, {
				class: 'p-2 grid grid-cols-[auto_1fr_auto] gap-4 items-center',
				get item() {
					return item();
				},
				element,
				$$slots: { element: true }
			});
		});
	}

	$.append($$anchor, fragment);
};

const subresult = ($$anchor, item = $.noop) => {
	var fragment_2 = $.comment();
	var node_4 = $.first_child(fragment_2);

	{
		const element = ($$anchor, attributes = $.noop) => {
			var a_1 = root_1();

			$.attribute_effect(a_1, () => ({ ...attributes(), href: item().href }));

			var node_5 = $.sibling($.child(a_1), 2);

			HashIcon(node_5, { class: 'size-4 opacity-50' });

			var div_1 = $.sibling(node_5, 2);
			var node_6 = $.child(div_1);

			$.component(node_6, () => Combobox.ItemText, ($$anchor, Combobox_ItemText_1) => {
				Combobox_ItemText_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, item().title));
						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			var p_1 = $.sibling(node_6, 2);

			$.html(p_1, () => item().excerpt, true);
			$.reset(p_1);
			$.reset(div_1);

			var node_7 = $.sibling(div_1, 2);

			ChevronRightIcon(node_7, { class: 'size-4 opacity-50' });
			$.reset(a_1);
			$.append($$anchor, a_1);
		};

		$.component(node_4, () => Combobox.Item, ($$anchor, Combobox_Item_1) => {
			Combobox_Item_1($$anchor, {
				class: 'p-2 grid grid-cols-[auto_auto_1fr_auto] gap-4 items-center',
				get item() {
					return item();
				},
				element,
				$$slots: { element: true }
			});
		});
	}

	$.append($$anchor, fragment_2);
};

var root = $.from_html(`<a><!> <div class="space-y-1"><!> <p class="text-xs"> </p></div> <!></a>`);
var root_1 = $.from_html(`<a><svg class="w-6 h-12 opacity-50" viewBox="0 0 24 54"><g stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v42M20 27H8.3"></path></g></svg> <!> <div class="space-y-1"><!> <p class="text-xs text-surface-600-400 wrap-break-word [&amp;>mark]:mark"></p></div> <!></a>`);
var root_2 = $.from_html(`<!> <span class="opacity-60">Search...</span> <span class="badge preset-outlined-surface-500 hidden md:flex opacity-60 scale-90">⌘ K</span>`, 1);
var root_3 = $.from_html(`<label class="label preset-tonal" title="search" aria-label="search"><!></label> <!>`, 1);
var root_4 = $.from_html(`<span class="py-10 text-center opacity-50">What can we help you find?</span>`);
var root_5 = $.from_html(`<span class="py-10 text-center opacity-50">Searching...</span>`);
var root_6 = $.from_html(`<span class="py-10 text-center opacity-50">No results found for <code class="code"> </code></span>`);
var root_7 = $.from_html(`<div class="px-4 pt-4 pb-4 lg:pb-2"><!></div> <hr class="hr"/> <!> <hr class="hidden lg:block hr"/> <div class="hidden lg:flex gap-2 px-4 pb-4 pt-2"><span class="text-sm opacity-50"><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> Navigate</span> <span class="text-sm opacity-50"><kbd class="kbd">⏎</kbd> Select</span> <span class="text-sm opacity-50"><kbd class="kbd">Esc</kbd> Close</span></div>`, 1);
var root_8 = $.from_html(`<!> <!>`, 1);

export default function Search($$anchor, $$props) {
	const // @ts-expect-error pagefind is only present during runtime
	id = $.props_id();

	$.push($$props, true);

	const search = $.proxy({ query: '', status: 'idle', items: [] });

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
				return item.href.startsWith(`/docs/${$$props.activeFramework.id}/`);
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

	$.user_effect(() => on(document, 'keydown', (event) => {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			dialog().setOpen(true);
		}
	}));

	var fragment_4 = $.comment();
	var node_8 = $.first_child(fragment_4);

	$.component(node_8, () => Dialog.Provider, ($$anchor, Dialog_Provider) => {
		Dialog_Provider($$anchor, {
			get value() {
				return dialog;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_8();
				var node_9 = $.first_child(fragment_5);

				$.component(node_9, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
					Dialog_Trigger($$anchor, {
						class: 'btn preset-tonal justify-start',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_2();
							var node_10 = $.first_child(fragment_6);

							SearchIcon(node_10, { class: 'size-4 opacity-60' });
							$.next(4);
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_9, 2);

				Portal(node_11, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_8();
						var node_12 = $.first_child(fragment_7);

						$.component(node_12, () => Dialog.Backdrop, ($$anchor, Dialog_Backdrop) => {
							Dialog_Backdrop($$anchor, {
								class: 'fixed inset-0 z-50 bg-surface-50-950/50 backdrop-blur-[2px]'
							});
						});

						var node_13 = $.sibling(node_12, 2);

						$.component(node_13, () => Dialog.Positioner, ($$anchor, Dialog_Positioner) => {
							Dialog_Positioner($$anchor, {
								class: 'fixed inset-0 z-50 flex justify-center items-start mt-[5%] p-4',
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = $.comment();
									var node_14 = $.first_child(fragment_8);

									$.component(node_14, () => Dialog.Content, ($$anchor, Dialog_Content) => {
										Dialog_Content($$anchor, {
											class: 'card bg-surface-50-950/90 backdrop-blur-sm border border-surface-200-800 w-full max-w-[960px] space-y-4 shadow-[0_0_100px_rgba(0,0,0,0.25)] shadow-primary-500/50 transition transition-discrete duration-200 opacity-0 starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100 motion-reduce:transition-none',
											children: ($$anchor, $$slotProps) => {
												{
													let $0 = $.derived(() => dialog().open);

													Combobox($$anchor, {
														class: 'w-full flex flex-col',
														placeholder: 'Search...',
														get collection() {
															return $.get(collection);
														},

														get inputValue() {
															return search.query;
														},
														onInputValueChange,
														onValueChange,
														onHighlightChange,
														inputBehavior: 'autohighlight',
														selectionBehavior: 'preserve',
														get open() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_10 = root_7();
															var div_2 = $.first_child(fragment_10);
															var node_15 = $.child(div_2);

															$.component(node_15, () => Combobox.Control, ($$anchor, Combobox_Control) => {
																Combobox_Control($$anchor, {
																	class: 'field-group grid-cols-[auto_1fr]',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_11 = root_3();
																		var label = $.first_child(fragment_11);
																		var node_16 = $.child(label);

																		SearchIcon(node_16, { class: 'size-4' });
																		$.reset(label);

																		var node_17 = $.sibling(label, 2);

																		$.component(node_17, () => Combobox.Input, ($$anchor, Combobox_Input) => {
																			Combobox_Input($$anchor, { class: 'input rounded-s-none', type: 'search' });
																		});

																		$.append($$anchor, fragment_11);
																	},
																	$$slots: { default: true }
																});
															});

															$.reset(div_2);

															var node_18 = $.sibling(div_2, 4);

															{
																var consequent = ($$anchor) => {
																	var span = root_4();

																	$.append($$anchor, span);
																};

																var consequent_1 = ($$anchor) => {
																	var span_1 = root_5();

																	$.append($$anchor, span_1);
																};

																var consequent_2 = ($$anchor) => {
																	var span_2 = root_6();
																	var code = $.sibling($.child(span_2));
																	var text_3 = $.only_child(code, true);

																	$.reset(span_2);
																	$.template_effect(() => $.set_text(text_3, search.query));
																	$.append($$anchor, span_2);
																};

																var consequent_5 = ($$anchor) => {
																	var fragment_12 = $.comment();
																	var node_19 = $.first_child(fragment_12);

																	$.component(node_19, () => Combobox.Content, ($$anchor, Combobox_Content) => {
																		Combobox_Content($$anchor, {
																			class: 'relative px-4 py-2 border-none bg-transparent max-h-[50dvh] overflow-y-auto',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_13 = $.comment();
																				var node_20 = $.first_child(fragment_13);

																				$.each(node_20, 16, () => $.get(collection).items, (item) => item, ($$anchor, item) => {
																					var fragment_14 = $.comment();
																					var node_21 = $.first_child(fragment_14);

																					{
																						var consequent_3 = ($$anchor) => {
																							result($$anchor, () => item);
																						};

																						var consequent_4 = ($$anchor) => {
																							subresult($$anchor, () => item);
																						};

																						$.if(node_21, ($$render) => {
																							if (item.type === 'result') $$render(consequent_3); else if (item.type === 'subresult') $$render(consequent_4, 1);
																						});
																					}

																					$.append($$anchor, fragment_14);
																				});

																				$.append($$anchor, fragment_13);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_12);
																};

																$.if(node_18, ($$render) => {
																	if (search.status === 'idle') $$render(consequent); else if (search.status === 'searching') $$render(consequent_1, 1); else if (search.status === 'no-results') $$render(consequent_2, 2); else if (search.status === 'results') $$render(consequent_5, 3);
																});
															}

															$.next(4);
															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												}
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_4);
	$.pop();
}