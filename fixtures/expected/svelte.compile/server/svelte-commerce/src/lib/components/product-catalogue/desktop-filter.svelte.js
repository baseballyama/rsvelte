import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils/index.js';
import { X } from '@lucide/svelte';
import { fade, fly } from 'svelte/transition';
import { quintOut } from 'svelte/easing';
import { browser } from '$app/environment';
import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
import { GetColorName } from 'hex-color-to-color-name';
import { getDesktopFilterState } from '$lib/core/composables/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { page } from '$app/state';
import Textbox from '../form/textbox.svelte';

export default function Desktop_filter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className = '' } = $$props;
		const filterState = getDesktopFilterState();

		function formatCategoryName(input) {
			const x = filterState.formatFilterOptionName(input);

			if (x.length > 27) return x.substring(0, 24) + '...';

			return x;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="ed-df group sticky"${$.attr_style(`top: ${filterState.containerTop}px;`)}><div${$.attr_class($.clsx(cn('ed-df__panel intra-gap flex min-w-56 flex-col overflow-y-auto !pb-20 scrollbar-none scrollbar-track-transparent scrollbar-thumb-transparent  group-hover:scrollbar-track-inherit group-hover:scrollbar-thumb-inherit', className)), 'svelte-1xbwik7')}${$.attr_style(`height: ${browser
				? window?.innerHeight - (filterState.containerTop || 0)
				: 'auto'}px`)}><div class="flex items-center justify-between"><p class="ed-df__title text-lg font-bold svelte-1xbwik7">Filters</p> `);

			if (filterState.anyFilterApplied) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					variant: 'link',
					size: 'sm',
					class: 'ed-df__clear h-auto p-0',
					onclick: filterState.clearFilters,
					children: ($$renderer) => {
						X($$renderer, { class: 'mr-1 h-3 w-3' });
						$$renderer.push(`<!----> Clear`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="ed-df__rule w-full border-b border-gray-200 svelte-1xbwik7"></div>  `);

			if (filterState.categories.length > 0) {
				$$renderer.push('<!--[0-->');

				if (filterState.showCategorySearch) {
					$$renderer.push(`<!--[0--><div class="relative mx-auto w-[calc(100%-0.5rem)]"><input${$.attr('value', filterState.categorySearchQuery)} type="text" placeholder="Search categories" class="ed-df__search w-full rounded-md border-0 py-2 pl-3 text-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-primary svelte-1xbwik7" autofocus=""/> `);

					Button($$renderer, {
						variant: 'ghost',
						size: 'icon',
						class: 'absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full',
						onclick: () => filterState.toggleCategorySearch(),
						children: ($$renderer) => {
							X($$renderer, { class: 'h-4 w-4' });
							$$renderer.push(`<!----> <span class="sr-only">Close search</span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="flex items-center justify-between"><p class="ed-df__label text-sm font-bold uppercase text-gray-900 svelte-1xbwik7">Categories</p> `);

					Button($$renderer, {
						variant: 'ghost',
						size: 'icon',
						class: 'h-8 w-8 rounded-full',
						onclick: () => filterState.toggleCategorySearch(),
						'aria-label': 'Toggle category search',
						children: ($$renderer) => {
							$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg> <span class="sr-only">Search</span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--> <div class="flex flex-col items-start justify-start text-sm">`);

				if (!filterState.showMoreCategories) {
					$$renderer.push('<!--[0-->');

					const categoriesToShow = filterState.filteredCategories.slice(0, 5);

					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(categoriesToShow);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let category = each_array[$$index];
						const formattedCategoryName = filterState.formatFilterOptionName(category.name);

						Button($$renderer, {
							variant: 'link',
							title: formattedCategoryName,
							class: 'group h-auto gap-2 overflow-hidden text-ellipsis whitespace-nowrap px-0 py-1 text-start hover:bg-transparent',
							onclick: () => filterState.handleCategoryClick({ slug: category.slug, name: category.name }),
							children: ($$renderer) => {
								if (category.thumbnail) {
									$$renderer.push(`<!--[0--><img${$.attr('src', category.thumbnail)}${$.attr('alt', formattedCategoryName)} class="h-8 w-8 rounded object-cover transition-opacity group-hover:opacity-80"/>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> <span class="ed-df__cat flex-1 py-0.5 capitalize text-gray-600 transition-colors group-hover:text-primary svelte-1xbwik7">${$.escape(formatCategoryName(category.name))}</span>`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]--> `);

					if (filterState.filteredCategories.length > 5) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							variant: 'link',
							size: 'sm',
							class: 'ed-df__more mt-1 h-auto justify-start p-0',
							onclick: filterState.toggleShowMoreCategories,
							children: ($$renderer) => {
								$$renderer.push(`<!---->+ ${$.escape(filterState.filteredCategories.length - 5)} more`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push(`<!--[-1--><!--[-->`);

					const each_array_1 = $.ensure_array_like(filterState.filteredCategories);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let category = each_array_1[$$index_1];
						const formattedCategoryName = filterState.formatFilterOptionName(category.name);

						Button($$renderer, {
							variant: 'link',
							title: formattedCategoryName,
							class: 'group h-auto gap-2 overflow-hidden text-ellipsis whitespace-nowrap px-0 py-1 text-start hover:bg-transparent',
							onclick: () => filterState.handleCategoryClick({ slug: category.slug, name: category.name }),
							children: ($$renderer) => {
								if (category.thumbnail) {
									$$renderer.push(`<!--[0--><img${$.attr('src', category.thumbnail)}${$.attr('alt', formattedCategoryName)} class="h-8 w-8 rounded object-cover transition-opacity group-hover:opacity-80"/>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> <span class="ed-df__cat flex-1 py-0.5 capitalize text-gray-600 transition-colors group-hover:text-primary svelte-1xbwik7">${$.escape(formatCategoryName(category.name))}</span>`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]--> `);

					Button($$renderer, {
						variant: 'link',
						size: 'sm',
						class: 'ed-df__more mt-1 h-auto justify-start p-0',
						onclick: filterState.toggleShowMoreCategories,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Show less`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (filterState.tags.length > 0) {
				$$renderer.push(`<!--[0--><div class="ed-df__rule w-full border-b border-gray-200 svelte-1xbwik7"></div> `);

				if (filterState.showTagSearch) {
					$$renderer.push(`<!--[0--><div class="relative mx-auto w-[calc(100%-0.5rem)]"><input${$.attr('value', filterState.tagSearchQuery)} type="text" placeholder="Search tags" class="ed-df__search w-full rounded-md border-0 py-2 pl-3 text-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-primary svelte-1xbwik7" autofocus=""/> `);

					Button($$renderer, {
						variant: 'ghost',
						size: 'icon',
						class: 'absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full',
						onclick: () => filterState.toggleTagSearch(),
						children: ($$renderer) => {
							X($$renderer, { class: 'h-4 w-4' });
							$$renderer.push(`<!----> <span class="sr-only">Close search</span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="flex items-center justify-between"><p class="ed-df__label text-sm font-bold uppercase text-gray-900 svelte-1xbwik7">Tags</p> `);

					Button($$renderer, {
						class: 'flex w-8 items-center justify-center rounded-full text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700',
						variant: 'ghost',
						size: 'icon',
						onclick: () => filterState.toggleTagSearch(),
						children: ($$renderer) => {
							$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg> <span class="sr-only">Search</span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--> <div class="flex flex-col text-sm">`);

				if (!filterState.showMoreTags) {
					$$renderer.push('<!--[0-->');

					const tagsToShow = filterState.filteredTags.slice(0, 5);

					$$renderer.push(`<!--[-->`);

					const each_array_2 = $.ensure_array_like(tagsToShow);

					for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
						let tag = each_array_2[$$index_2];

						$$renderer.push(`<div class="flex flex-row items-center gap-2">`);

						Checkbox($$renderer, {
							id: `tag-${tag.slug || tag.name}`,
							checked: filterState.selectedTags.find((t) => t.name === tag.name) ? true : false,
							onCheckedChange: (checked) => {
								filterState.handleTagChange({ tag, checked });
							}
						});

						$$renderer.push(`<!----> <label${$.attr('for', `tag-${tag.slug || tag.name}`)} class="ed-df__opt flex-1 cursor-pointer py-1 capitalize text-gray-600 transition-colors hover:text-gray-900 svelte-1xbwik7">${$.escape(tag.name)}</label></div>`);
					}

					$$renderer.push(`<!--]--> `);

					if (filterState.filteredTags.length > 5) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							variant: 'link',
							size: 'sm',
							class: 'ed-df__more mt-1 h-auto justify-start p-0',
							onclick: filterState.toggleShowMoreTags,
							children: ($$renderer) => {
								$$renderer.push(`<!---->+ ${$.escape(filterState.filteredTags.length - 5)} more`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push(`<!--[-1--><!--[-->`);

					const each_array_3 = $.ensure_array_like(filterState.filteredTags);

					for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
						let tag = each_array_3[$$index_3];

						$$renderer.push(`<div class="flex flex-row items-center gap-2">`);

						Checkbox($$renderer, {
							id: `tag-${tag.slug || tag.name}`,
							checked: filterState.selectedTags.find((t) => t.name === tag.name) ? true : false,
							onCheckedChange: (checked) => {
								filterState.handleTagChange({ tag, checked });
							}
						});

						$$renderer.push(`<!----> <label${$.attr('for', `tag-${tag.slug || tag.name}`)} class="ed-df__opt flex-1 cursor-pointer py-1 capitalize text-gray-600 transition-colors hover:text-gray-900 svelte-1xbwik7">${$.escape(tag.name)}</label></div>`);
					}

					$$renderer.push(`<!--]--> `);

					Button($$renderer, {
						variant: 'link',
						size: 'sm',
						class: 'ed-df__more mt-1 h-auto justify-start p-0',
						onclick: filterState.toggleShowMoreTags,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Show less`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]--></div> <div class="ed-df__rule w-full border-b border-gray-200 svelte-1xbwik7"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <p class="ed-df__label text-sm font-bold uppercase text-gray-900 svelte-1xbwik7">Price Range</p> <div class="ed-df__slider relative mr-5 mt-2"><div class="ed-df__track absolute h-1 w-full rounded bg-gray-100 svelte-1xbwik7"><div class="ed-df__fill absolute h-1 bg-primary svelte-1xbwik7"${$.attr_style(`left: ${$.stringify(filterState.priceSliderLeftPercentage)}%; right: ${$.stringify(filterState.priceSliderRightPercentage)}%`)}></div></div> <input type="range"${$.attr('value', filterState.minPrice)} aria-label="Choose minimum price"${$.attr('min', filterState.minPossiblePrice)}${$.attr('max', filterState.maxPossiblePrice)} class="pointer-events-none absolute h-1 w-full appearance-none bg-transparent [&amp;::-moz-range-thumb]:pointer-events-auto [&amp;::-moz-range-thumb]:h-4 [&amp;::-moz-range-thumb]:w-4 [&amp;::-moz-range-thumb]:cursor-pointer [&amp;::-moz-range-thumb]:appearance-none [&amp;::-moz-range-thumb]:rounded-full [&amp;::-moz-range-thumb]:border-2 [&amp;::-moz-range-thumb]:border-primary [&amp;::-moz-range-thumb]:bg-white [&amp;::-moz-range-thumb]:ring-1 [&amp;::-moz-range-thumb]:ring-black [&amp;::-webkit-slider-thumb]:pointer-events-auto [&amp;::-webkit-slider-thumb]:h-4 [&amp;::-webkit-slider-thumb]:w-4 [&amp;::-webkit-slider-thumb]:cursor-pointer [&amp;::-webkit-slider-thumb]:appearance-none [&amp;::-webkit-slider-thumb]:rounded-full [&amp;::-webkit-slider-thumb]:border-2 [&amp;::-webkit-slider-thumb]:border-primary [&amp;::-webkit-slider-thumb]:bg-white [&amp;::-webkit-slider-thumb]:ring-1 [&amp;::-webkit-slider-thumb]:ring-gray-300"/> <input type="range"${$.attr('value', filterState.maxPrice)}${$.attr('min', filterState.minPossiblePrice)} aria-label="Choose maximum price"${$.attr('max', filterState.maxPossiblePrice)} class="pointer-events-none absolute h-1 w-full appearance-none bg-transparent [&amp;::-moz-range-thumb]:pointer-events-auto [&amp;::-moz-range-thumb]:h-4 [&amp;::-moz-range-thumb]:w-4 [&amp;::-moz-range-thumb]:cursor-pointer [&amp;::-moz-range-thumb]:appearance-none [&amp;::-moz-range-thumb]:rounded-full [&amp;::-moz-range-thumb]:border-2 [&amp;::-moz-range-thumb]:border-primary [&amp;::-moz-range-thumb]:bg-white [&amp;::-moz-range-thumb]:ring-1 [&amp;::-moz-range-thumb]:ring-black [&amp;::-webkit-slider-thumb]:pointer-events-auto [&amp;::-webkit-slider-thumb]:h-4 [&amp;::-webkit-slider-thumb]:w-4 [&amp;::-webkit-slider-thumb]:cursor-pointer [&amp;::-webkit-slider-thumb]:appearance-none [&amp;::-webkit-slider-thumb]:rounded-full [&amp;::-webkit-slider-thumb]:border-2 [&amp;::-webkit-slider-thumb]:border-primary [&amp;::-webkit-slider-thumb]:bg-white [&amp;::-webkit-slider-thumb]:ring-1 [&amp;::-webkit-slider-thumb]:ring-gray-300"/></div> <div class="ed-df__prices mt-4 grid grid-cols-2 gap-3">`);

			Textbox($$renderer, {
				type: 'number',
				label: `Min (${$.stringify(page.data?.store?.currency?.symbol)})`,
				onchange: filterState.handleMinPriceChange,
				get value() {
					return filterState.minPrice;
				},

				set value($$value) {
					filterState.minPrice = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				type: 'number',
				label: `Max (${$.stringify(page.data?.store?.currency?.symbol)})`,
				onchange: filterState.handleMaxPriceChange,
				get value() {
					return filterState.maxPrice;
				},

				set value($$value) {
					filterState.maxPrice = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			if (filterState.processedFilters) {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array_4 = $.ensure_array_like(Object.keys(filterState.processedFilters));

				for (let idx = 0, $$length = each_array_4.length; idx < $$length; idx++) {
					let key = each_array_4[idx];

					$$renderer.push(`<div class="ed-df__rule w-full border-b border-gray-200 svelte-1xbwik7"></div> <div class="intra-gap flex flex-col"><p class="ed-df__label text-sm font-bold uppercase text-gray-900 svelte-1xbwik7">${$.escape(filterState.formatFilterName(key))}</p> <div class="flex flex-col space-y-1 text-sm">`);

					if (!filterState.showMoreGeneralFilters[idx]) {
						$$renderer.push('<!--[0-->');

						const valuesToShow = filterState.processedFilters[key].slice(0, 3);

						$$renderer.push(`<!--[-->`);

						const each_array_5 = $.ensure_array_like(valuesToShow);

						for (let $$index_4 = 0, $$length = each_array_5.length; $$index_4 < $$length; $$index_4++) {
							let value = each_array_5[$$index_4];

							$$renderer.push(`<div class="flex flex-row items-center gap-2">`);

							Checkbox($$renderer, {
								id: `gen-${value}`,
								checked: filterState.selectedGeneralFilters[key]?.includes(value),
								onCheckedChange: (checked) => {
									filterState.handleGeneralFiltersChange({ key, value, checked });
								}
							});

							$$renderer.push(`<!----> <label${$.attr('for', `gen-${value}`)} class="ed-df__opt flex-1 cursor-pointer py-1 capitalize text-gray-600 transition-colors hover:text-gray-900 svelte-1xbwik7">`);

							if (value?.startsWith?.('#')) {
								$$renderer.push(`<!--[0--><div class="flex items-center gap-2"><div class="h-4 w-4 rounded-full border border-gray-200"${$.attr_style(`background-color: ${$.stringify(value)};`)}></div> ${$.escape(GetColorName(value))}</div>`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(value)}`);
							}

							$$renderer.push(`<!--]--></label></div>`);
						}

						$$renderer.push(`<!--]--> `);

						if (filterState.processedFilters[key].length > 3) {
							$$renderer.push('<!--[0-->');

							Button($$renderer, {
								variant: 'link',
								size: 'sm',
								class: 'ed-df__more mt-1 h-auto justify-start p-0',
								onclick: () => {
									filterState.showMoreGeneralFilters[idx] = true;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->+ ${$.escape(filterState.processedFilters[key].length - 3)} more`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1--><!--[-->`);

						const each_array_6 = $.ensure_array_like(filterState.processedFilters[key]);

						for (let $$index_5 = 0, $$length = each_array_6.length; $$index_5 < $$length; $$index_5++) {
							let value = each_array_6[$$index_5];

							$$renderer.push(`<div class="flex flex-row items-center gap-2">`);

							Checkbox($$renderer, {
								id: `gen-${value}`,
								checked: filterState.selectedGeneralFilters[key]?.includes(value),
								onCheckedChange: (checked) => {
									filterState.handleGeneralFiltersChange({ key, value, checked });
								}
							});

							$$renderer.push(`<!----> <label${$.attr('for', `gen-${value}`)} class="ed-df__opt flex-1 cursor-pointer py-1 capitalize text-gray-600 transition-colors hover:text-gray-900 svelte-1xbwik7">`);

							if (value?.startsWith?.('#')) {
								$$renderer.push(`<!--[0--><div class="flex items-center gap-2"><div class="h-4 w-4 rounded-full border border-gray-200"${$.attr_style(`background-color: ${$.stringify(value)};`)}></div> ${$.escape(GetColorName(value))}</div>`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(value)}`);
							}

							$$renderer.push(`<!--]--></label></div>`);
						}

						$$renderer.push(`<!--]--> `);

						Button($$renderer, {
							variant: 'link',
							size: 'sm',
							class: 'ed-df__more mt-1 h-auto justify-start p-0',
							onclick: () => {
								filterState.showMoreGeneralFilters[idx] = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<!---->Show less`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}