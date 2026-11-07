import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArrowUpRight, Search, X } from '@lucide/svelte';
import { Input } from '$lib/components/ui/input/index.js';
import MsSearchRenderer from './ms-search-renderer.svelte';
import { fade, scale } from 'svelte/transition';
import Button from '../ui/button/button.svelte';
import { priceRoundUp } from '@misiki/kitcommerce-core/utils';
import { page } from '$app/state';

var root = $.from_html(`<div class="h-16 w-full animate-pulse bg-gray-50"></div>`);
var root_1 = $.from_html(`<div class="space-y-2 p-2"></div>`);
var root_2 = $.from_html(`<img alt="" class="h-full w-full object-cover"/>`);
var root_3 = $.from_html(`<div class="flex h-full w-full items-center justify-center"><!></div>`);
var root_4 = $.from_html(`<p class="text-sm font-medium text-primary"> </p>`);
var root_5 = $.from_html(`<div class="h-14 w-14 flex-shrink-0 overflow-hidden bg-gray-100 ring-1 ring-black/5"><!></div> <div class="min-w-0 flex-1 text-left"><p class="truncate font-semibold text-gray-900"> </p> <!></div> <!>`, 1);
var root_6 = $.from_html(`<li><!></li>`);
var root_7 = $.from_html(`<ul class="space-y-1"></ul>`);
var root_8 = $.from_html(`<div class="flex flex-col items-center justify-center py-16 text-center"><div class="mb-4 rounded-full bg-gray-50 p-4"><!></div> <p class="text-lg font-medium text-gray-900">No products found</p> <p class="text-sm text-gray-500"> </p></div>`);
var root_9 = $.from_html(`<div class="flex flex-col items-center justify-center py-16 text-center"><div class="mb-4 rounded-full bg-gray-50 p-4"><!></div> <p class="text-sm text-gray-500">Start typing to search products.</p></div>`);
var root_10 = $.from_html(`<div class="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm transition-all"><div class="mt-4 w-full max-w-2xl px-4 sm:mt-20"><div class="ed-search-panel flex max-h-[80vh] flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-black/5"><div class="ed-search-head flex items-center gap-3 border-b border-gray-100 p-4"><!> <!> <!></div> <div class="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-track-transparent"><!></div></div></div></div>`);
var root_11 = $.from_html(`<button class="ed-search-trigger flex rounded-full px-2" aria-label="Open search"><!></button> <!>`, 1);

export default function Ms_search($$anchor, $$props) {
	$.push($$props, true);

	// Local renderer: Enter goes to the clean slug route and `loading` tracks every query.
	let className = $.prop($$props, 'class', 3, ''),
		placeholder = $.prop($$props, 'placeholder', 3, 'Search...'),
		handleCloseSearch = $.prop($$props, 'handleCloseSearch', 3, () => {});

	let search = $.state('');

	{
		const content = ($$anchor, $$arg0) => {
			let searchResults = () => ($$arg0?.()).searchResults;
			let showSearchResults = () => ($$arg0?.()).showSearchResults;
			let loading = () => ($$arg0?.()).loading;
			let searchPlugin = () => ($$arg0?.()).searchPlugin;
			let expandSearch = () => ($$arg0?.()).expandSearch;
			let showSearch = () => ($$arg0?.()).showSearch;
			let closeSearch = () => ($$arg0?.()).closeSearch;
			let handleKeyDown = () => ($$arg0?.()).handleKeyDown;
			let handleResultClick = () => ($$arg0?.()).handleResultClick;
			var fragment_1 = root_11();
			var button = $.first_child(fragment_1);
			var node = $.child(button);

			Search(node, { class: 'h-5 w-5' });
			$.reset(button);

			var node_1 = $.sibling(button, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div = root_10();
					var div_1 = $.child(div);
					var div_2 = $.child(div_1);
					var div_3 = $.child(div_2);
					var node_2 = $.child(div_3);

					Search(node_2, { class: 'h-5 w-5 text-gray-400' });

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => searchPlugin()?.placeholder || 'Search products...');
						let $1 = $.derived(() => searchPlugin()?.placeholder || 'Search products');

						Input(node_3, {
							type: 'text',
							class: 'flex-1 border-none bg-transparent text-sm sm:text-lg shadow-none focus-visible:ring-0',
							get placeholder() {
								return $.get($0);
							},

							get 'aria-label'() {
								return $.get($1);
							},
							autocomplete: 'off',
							enterkeyhint: 'search',
							autofocus: true,
							get onkeydown() {
								return handleKeyDown();
							},

							get value() {
								return $.get(search);
							},

							set value($$value) {
								$.set(search, $$value, true);
							}
						});
					}

					var node_4 = $.sibling(node_3, 2);

					Button(node_4, {
						variant: 'ghost',
						size: 'icon',
						onclick: () => {
							closeSearch()();
							handleCloseSearch()();
						},
						class: 'rounded-full text-gray-400 hover:text-gray-600',
						'aria-label': 'Close search',
						children: ($$anchor, $$slotProps) => {
							X($$anchor, { class: 'h-5 w-5' });
						},
						$$slots: { default: true }
					});

					$.reset(div_3);

					var div_4 = $.sibling(div_3, 2);
					var node_5 = $.child(div_4);

					{
						var consequent = ($$anchor) => {
							var div_5 = root_1();

							$.each(div_5, 20, () => Array(5), $.index, ($$anchor, _) => {
								var div_6 = root();

								$.append($$anchor, div_6);
							});

							$.reset(div_5);
							$.append($$anchor, div_5);
						};

						var consequent_3 = ($$anchor) => {
							var ul = root_7();

							$.each(ul, 21, searchResults, $.index, ($$anchor, result) => {
								var li = root_6();
								var node_6 = $.child(li);

								Button(node_6, {
									variant: 'ghost',
									class: 'flex w-full h-auto items-center justify-start gap-4 p-3 text-left',
									onclick: () => {
										handleResultClick()($.get(result));
										handleCloseSearch()();
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_5();
										var div_7 = $.first_child(fragment_3);
										var node_7 = $.child(div_7);

										{
											var consequent_1 = ($$anchor) => {
												var img = root_2();

												$.template_effect(() => $.set_attribute(img, 'src', $.get(result).thumbnail));
												$.append($$anchor, img);
											};

											var alternate = ($$anchor) => {
												var div_8 = root_3();
												var node_8 = $.child(div_8);

												Search(node_8, { class: 'h-5 w-5 text-gray-200' });
												$.reset(div_8);
												$.append($$anchor, div_8);
											};

											$.if(node_7, ($$render) => {
												if ($.get(result).thumbnail) $$render(consequent_1); else $$render(alternate, -1);
											});
										}

										$.reset(div_7);

										var div_9 = $.sibling(div_7, 2);
										var p = $.child(div_9);
										var text = $.only_child(p, true);
										var node_9 = $.sibling(p, 2);

										{
											var consequent_2 = ($$anchor) => {
												var p_1 = root_4();
												var text_1 = $.only_child(p_1, true);

												$.template_effect(($0) => $.set_text(text_1, $0), [
													() => priceRoundUp($.get(result)?.price, page?.data?.store?.currency?.code)
												]);

												$.append($$anchor, p_1);
											};

											$.if(node_9, ($$render) => {
												if ($.get(result).price) $$render(consequent_2);
											});
										}

										$.reset(div_9);

										var node_10 = $.sibling(div_9, 2);

										ArrowUpRight(node_10, { class: 'h-5 w-5 text-gray-300' });
										$.template_effect(() => $.set_text(text, $.get(result).name || $.get(result).title));
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});

								$.reset(li);
								$.append($$anchor, li);
							});

							$.reset(ul);
							$.append($$anchor, ul);
						};

						var consequent_4 = ($$anchor) => {
							var div_10 = root_8();
							var div_11 = $.child(div_10);
							var node_11 = $.child(div_11);

							Search(node_11, { class: 'h-8 w-8 text-gray-300' });
							$.reset(div_11);

							var p_2 = $.sibling(div_11, 4);
							var text_2 = $.only_child(p_2);

							$.reset(div_10);
							$.template_effect(() => $.set_text(text_2, `We couldn't find any results matching "${$.get(search) ?? ''}".`));
							$.append($$anchor, div_10);
						};

						var d = $.derived(() => $.get(search).trim());

						var alternate_1 = ($$anchor) => {
							var div_12 = root_9();
							var div_13 = $.child(div_12);
							var node_12 = $.child(div_13);

							Search(node_12, { class: 'h-8 w-8 text-gray-300' });
							$.reset(div_13);
							$.next(2);
							$.reset(div_12);
							$.append($$anchor, div_12);
						};

						$.if(node_5, ($$render) => {
							if (loading()) $$render(consequent); else if (searchResults().length > 0) $$render(consequent_3, 1); else if ($.get(d)) $$render(consequent_4, 2); else $$render(alternate_1, -1);
						});
					}

					$.reset(div_4);
					$.reset(div_2);
					$.reset(div_1);
					$.reset(div);

					$.delegated('click', div, () => {
						closeSearch()();
						handleCloseSearch()();
					});

					$.delegated('click', div_1, (e) => e.stopPropagation());
					$.transition(3, div_1, () => scale, () => ({ duration: 200, start: 0.95, opacity: 0 }));
					$.transition(3, div, () => fade, () => ({ duration: 200 }));
					$.append($$anchor, div);
				};

				$.if(node_1, ($$render) => {
					if (expandSearch() && showSearchResults()) $$render(consequent_5);
				});
			}

			$.delegated('click', button, function (...$$args) {
				showSearch()?.apply(this, $$args);
			});

			$.append($$anchor, fragment_1);
		};

		MsSearchRenderer($$anchor, {
			get search() {
				return $.get(search);
			},

			set search($$value) {
				$.set(search, $$value, true);
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}

$.delegate(['click']);