import * as $ from 'svelte/internal/server';
import { ArrowUpRight, Search, X } from '@lucide/svelte';
import { Input } from '$lib/components/ui/input/index.js';
import MsSearchRenderer from './ms-search-renderer.svelte';
import { fade, scale } from 'svelte/transition';
import Button from '../ui/button/button.svelte';
import { priceRoundUp } from '@misiki/kitcommerce-core/utils';
import { page } from '$app/state';

export default function Ms_search($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Local renderer: Enter goes to the clean slug route and `loading` tracks every query.
		let {
			class: className = '',
			placeholder = 'Search...',
			handleCloseSearch = () => {}
		} = $$props;

		let search = '';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function content(
					$$renderer,
					{
						searchResults,
						showSearchResults,
						loading,
						searchPlugin,
						expandSearch,
						showSearch,
						closeSearch,
						handleKeyDown,
						handleResultClick
					}
				) {
					$$renderer.push(`<button class="ed-search-trigger flex rounded-full px-2" aria-label="Open search">`);
					Search($$renderer, { class: 'h-5 w-5' });
					$$renderer.push(`<!----></button> `);

					if (expandSearch && showSearchResults) {
						$$renderer.push(`<!--[0--><div class="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm transition-all"><div class="mt-4 w-full max-w-2xl px-4 sm:mt-20"><div class="ed-search-panel flex max-h-[80vh] flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-black/5"><div class="ed-search-head flex items-center gap-3 border-b border-gray-100 p-4">`);
						Search($$renderer, { class: 'h-5 w-5 text-gray-400' });
						$$renderer.push(`<!----> `);

						Input($$renderer, {
							type: 'text',
							class: 'flex-1 border-none bg-transparent text-sm sm:text-lg shadow-none focus-visible:ring-0',
							placeholder: searchPlugin?.placeholder || 'Search products...',
							'aria-label': searchPlugin?.placeholder || 'Search products',
							autocomplete: 'off',
							enterkeyhint: 'search',
							autofocus: true,
							onkeydown: handleKeyDown,
							get value() {
								return search;
							},

							set value($$value) {
								search = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							variant: 'ghost',
							size: 'icon',
							onclick: () => {
								closeSearch();
								handleCloseSearch();
							},
							class: 'rounded-full text-gray-400 hover:text-gray-600',
							'aria-label': 'Close search',
							children: ($$renderer) => {
								X($$renderer, { class: 'h-5 w-5' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-track-transparent">`);

						if (loading) {
							$$renderer.push(`<!--[0--><div class="space-y-2 p-2"><!--[-->`);

							const each_array = $.ensure_array_like(Array(5));

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let _ = each_array[$$index];

								$$renderer.push(`<div class="h-16 w-full animate-pulse bg-gray-50"></div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else if (searchResults.length > 0) {
							$$renderer.push(`<!--[1--><ul class="space-y-1"><!--[-->`);

							const each_array_1 = $.ensure_array_like(searchResults);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let result = each_array_1[$$index_1];

								$$renderer.push(`<li>`);

								Button($$renderer, {
									variant: 'ghost',
									class: 'flex w-full h-auto items-center justify-start gap-4 p-3 text-left',
									onclick: () => {
										handleResultClick(result);
										handleCloseSearch();
									},

									children: ($$renderer) => {
										$$renderer.push(`<div class="h-14 w-14 flex-shrink-0 overflow-hidden bg-gray-100 ring-1 ring-black/5">`);

										if (result.thumbnail) {
											$$renderer.push(`<!--[0--><img${$.attr('src', result.thumbnail)} alt="" class="h-full w-full object-cover"/>`);
										} else {
											$$renderer.push(`<!--[-1--><div class="flex h-full w-full items-center justify-center">`);
											Search($$renderer, { class: 'h-5 w-5 text-gray-200' });
											$$renderer.push(`<!----></div>`);
										}

										$$renderer.push(`<!--]--></div> <div class="min-w-0 flex-1 text-left"><p class="truncate font-semibold text-gray-900">${$.escape(result.name || result.title)}</p> `);

										if (result.price) {
											$$renderer.push(`<!--[0--><p class="text-sm font-medium text-primary">${$.escape(priceRoundUp(result?.price, page?.data?.store?.currency?.code))}</p>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div> `);
										ArrowUpRight($$renderer, { class: 'h-5 w-5 text-gray-300' });
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></li>`);
							}

							$$renderer.push(`<!--]--></ul>`);
						} else if (search.trim()) {
							$$renderer.push(`<!--[2--><div class="flex flex-col items-center justify-center py-16 text-center"><div class="mb-4 rounded-full bg-gray-50 p-4">`);
							Search($$renderer, { class: 'h-8 w-8 text-gray-300' });
							$$renderer.push(`<!----></div> <p class="text-lg font-medium text-gray-900">No products found</p> <p class="text-sm text-gray-500">We couldn't find any results matching "${$.escape(search)}".</p></div>`);
						} else {
							$$renderer.push(`<!--[-1--><div class="flex flex-col items-center justify-center py-16 text-center"><div class="mb-4 rounded-full bg-gray-50 p-4">`);
							Search($$renderer, { class: 'h-8 w-8 text-gray-300' });
							$$renderer.push(`<!----></div> <p class="text-sm text-gray-500">Start typing to search products.</p></div>`);
						}

						$$renderer.push(`<!--]--></div></div></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				MsSearchRenderer($$renderer, {
					get search() {
						return search;
					},

					set search($$value) {
						search = $$value;
						$$settled = false;
					},
					content,
					$$slots: { content: true }
				});
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