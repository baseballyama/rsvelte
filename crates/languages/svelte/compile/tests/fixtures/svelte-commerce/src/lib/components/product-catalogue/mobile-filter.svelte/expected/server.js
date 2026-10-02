import * as $ from 'svelte/internal/server';
import * as Drawer from '$lib/components/ui/drawer/index.js';
import { GetColorName } from 'hex-color-to-color-name';
import { ArrowDownNarrowWide, Filter, SearchIcon, X } from '@lucide/svelte';
import { fly } from 'svelte/transition';
import Button from '$lib/components/ui/button/button.svelte';
import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
import Input from '$lib/components/ui/input/input.svelte';
import { getDesktopFilterState } from '$lib/core/composables/index.js';
import { sortOptions } from '$lib/config.js';

export default function Mobile_filter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { selectedSort = void 0, onSortChange = (value) => {} } = $$props;
		const filterModule = getDesktopFilterState();

		function formatCategoryName(input) {
			const x = filterModule.formatFilterOptionName(input);

			if (x.length > 27) return x.substring(0, 24) + '...';

			return x;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="ed-mf__bar fixed bottom-0 left-0 right-0 z-40 grid h-12 w-full grid-cols-2 border-t border-gray-200 bg-white shadow-md md:hidden svelte-l2jkuf"><div class="flex items-center justify-center border-r border-gray-200">`);

			if (Drawer.Root) {
				$$renderer.push('<!--[-->');

				Drawer.Root($$renderer, {
					direction: 'bottom',
					get open() {
						return filterModule.showSortByDrawer;
					},

					set open($$value) {
						filterModule.showSortByDrawer = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Drawer.Trigger) {
							$$renderer.push('<!--[-->');

							Drawer.Trigger($$renderer, {
								class: 'flex h-full w-full items-center justify-center gap-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50',
								children: ($$renderer) => {
									ArrowDownNarrowWide($$renderer, { class: 'h-4 w-4 text-gray-500' });
									$$renderer.push(`<!----> <div class="flex flex-col items-start"><span class="font-semibold">Sort By</span> `);

									if (selectedSort) {
										$$renderer.push(`<!--[0--><span class="text-xs text-gray-500">${$.escape(sortOptions.find((item) => item.value === selectedSort)?.name)}</span>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Drawer.Content) {
							$$renderer.push('<!--[-->');

							Drawer.Content($$renderer, {
								class: 'rounded-t-xl',
								children: ($$renderer) => {
									if (Drawer.Header) {
										$$renderer.push('<!--[-->');

										Drawer.Header($$renderer, {
											class: 'border-b border-gray-100 py-3 text-left',
											children: ($$renderer) => {
												if (Drawer.Title) {
													$$renderer.push('<!--[-->');

													Drawer.Title($$renderer, {
														class: 'text-base font-semibold',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Sort By`);
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

									$$renderer.push(` <div class="space-y-3 px-4 py-3"><!--[-->`);

									const each_array = $.ensure_array_like(sortOptions);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let item = each_array[$$index];

										$$renderer.push(`<div class="flex items-center justify-between"><label${$.attr('for', item.value)}${$.attr_class(`w-full text-left text-sm ${selectedSort === item.value
											? 'font-medium text-primary'
											: 'font-normal text-gray-700'}`)}>${$.escape(item.name)}</label> `);

										Input($$renderer, {
											class: '!h-4 !w-4 border-gray-300 text-primary focus:ring-primary',
											id: item.value,
											type: 'radio',
											name: 'sort',
											value: item.value,
											checked: filterModule.selectedSort === item.value,
											onchange: () => {
												filterModule.selectedSort = item.value;
												onSortChange?.(item.value);
												filterModule.showSortByDrawer = false;
											}
										});

										$$renderer.push(`<!----></div>`);
									}

									$$renderer.push(`<!--]--></div>`);
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

			$$renderer.push(`</div> <div class="flex flex-col items-center justify-center bg-white transition hover:bg-gray-50">`);

			Button($$renderer, {
				variant: 'ghost',
				class: 'flex h-full w-full items-center justify-center rounded-none p-0 hover:bg-transparent',
				onclick: () => {
					filterModule.showFilter = true;
				},

				children: ($$renderer) => {
					Filter($$renderer, { class: 'mx-2 max-h-4 min-h-4 min-w-4 max-w-4 text-gray-500' });
					$$renderer.push(`<!----> <div class="flex max-w-[50%] flex-col items-start"><span class="text-sm font-semibold text-gray-700">Filter</span> <div class="grid grid-cols-1">`);

					if (filterModule.anyFilterApplied) {
						$$renderer.push(`<!--[0--><span class="truncate text-xs capitalize text-gray-500">${$.escape(Object.keys(filterModule.appliedFiltersCountByKey)?.splice?.(0, 2)?.map((k) => k?.includes('attributes') || k?.includes('option') ? k.split('.')?.[1] : k)?.join?.(', ') + (Object.keys(filterModule.appliedFiltersCountByKey)?.length > 2
							? ` +${Object.keys(filterModule.appliedFiltersCountByKey)?.length - 2}`
							: ''))}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div> <div${$.attr_class(`ed-mf__panel fixed inset-0 z-[1000] h-screen w-screen ${filterModule.showFilter ? 'translate-x-0' : '-translate-x-full'} transform bg-white transition-transform`, 'svelte-l2jkuf')}${$.attr('inert', !filterModule.showFilter, true)}${$.attr('aria-hidden', !filterModule.showFilter)}><div class="flex h-full flex-col"><div class="ed-mf__phead flex items-center justify-between border-b border-gray-100 !p-3 svelte-l2jkuf"><div class="flex w-full items-center justify-between gap-4"><div class="flex items-center justify-center gap-3">`);

			Button($$renderer, {
				variant: 'ghost',
				size: 'icon',
				class: 'rounded-full',
				onclick: () => filterModule.showFilter = false,
				children: ($$renderer) => {
					X($$renderer, { class: 'h-6 w-6 text-gray-900' });
					$$renderer.push(`<!----> <span class="sr-only">Close</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (filterModule.anyFilterApplied) {
				$$renderer.push(`<!--[0--><div class="h-4 w-px bg-gray-200"></div> `);

				Button($$renderer, {
					variant: 'link',
					size: 'sm',
					class: 'ed-mf__clear h-auto p-0',
					onclick: filterModule.clearFilters,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Clear All`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <h2 class="ed-mf__ptitle text-xs font-bold uppercase tracking-widest text-gray-900 svelte-l2jkuf">Filters</h2> `);

			Button($$renderer, {
				variant: 'default',
				class: 'ed-mf__apply h-9 bg-primary px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-black',
				onclick: filterModule.handleApply,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Apply`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div> <div class="flex flex-1 flex-col overflow-hidden"><div class="flex h-full"><div class="ed-mf__menu w-[35vw] overflow-y-auto bg-gray-50 svelte-l2jkuf"><!--[-->`);

			const each_array_1 = $.ensure_array_like(filterModule.menuItems);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let item = each_array_1[$$index_1];

				Button($$renderer, {
					variant: 'ghost',
					class: `ed-mf__tab h-auto w-full justify-between rounded-none border-l-4 px-4 py-4 ${filterModule.selectedSection === item.id
						? 'border-primary bg-white text-primary hover:bg-white'
						: 'border-transparent text-gray-500 hover:bg-gray-100'}`,
					onclick: () => filterModule.selectedSection = item.id,
					children: ($$renderer) => {
						$$renderer.push(`<span class="text-left text-[11px] font-bold uppercase tracking-widest">${$.escape(filterModule.formatFilterName(item.label))}</span> `);

						if (filterModule.appliedFiltersCountByKey[item.id]) {
							$$renderer.push(`<!--[0--><span class="text-[10px] text-primary">(${$.escape(filterModule.appliedFiltersCountByKey[item.id])})</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div> <div class="ed-mf__content flex-1 overflow-y-auto bg-white p-4">`);

			if (filterModule.selectedSection === 'discount') {
				$$renderer.push(`<!--[0--><div class="space-y-6"><div class="relative"><input type="text" placeholder="Search discount..." class="ed-mf__search w-full rounded-md border-0 bg-gray-100 py-2.5 pl-4 pr-10 text-sm ring-0 transition-all focus:ring-2 focus:ring-primary svelte-l2jkuf"${$.attr('value', filterModule.searchQuery)}/> `);

				SearchIcon($$renderer, {
					class: 'absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
				});

				$$renderer.push(`<!----></div> <div class="space-y-3"><!--[-->`);

				const each_array_2 = $.ensure_array_like(filterModule.discountOptions);

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let option = each_array_2[$$index_2];

					$$renderer.push(`<label class="group flex cursor-pointer items-center gap-3"><div class="relative flex items-center justify-center"><input type="radio" name="discount"${$.attr('value', option.value)}${$.attr('checked', filterModule.selectedDiscount === option.value, true)} class="peer h-5 w-5 appearance-none rounded-full border-2 border-gray-200 transition-all checked:border-primary"/> <div class="absolute h-2.5 w-2.5 rounded-full bg-primary opacity-0 transition-opacity peer-checked:opacity-100"></div></div> <span class="ed-mf__opt text-sm font-medium text-gray-700 transition-colors group-hover:text-primary svelte-l2jkuf">${$.escape(option.label)}</span></label>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else if (filterModule.selectedSection === 'category') {
				$$renderer.push(`<!--[1--><div class="relative mb-6"><input type="text" placeholder="Search category..." class="w-full rounded-md border-0 bg-gray-100 py-2.5 pl-4 pr-10 text-sm ring-0 transition-all focus:ring-2 focus:ring-primary"${$.attr('value', filterModule.categorySearchQuery)}/> `);

				SearchIcon($$renderer, {
					class: 'absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
				});

				$$renderer.push(`<!----></div> `);

				if (filterModule.filteredCategories?.length > 0) {
					$$renderer.push(`<!--[0--><div class="space-y-4"><!--[-->`);

					const each_array_3 = $.ensure_array_like(filterModule.filteredCategories);

					for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
						let category = each_array_3[$$index_3];
						const formattedCategoryName = filterModule.formatFilterOptionName(category.name);

						Button($$renderer, {
							variant: 'link',
							title: formattedCategoryName,
							class: 'group h-auto gap-2 overflow-hidden text-ellipsis whitespace-nowrap px-0 py-1 text-start hover:bg-transparent',
							onclick: () => filterModule.handleCategoryClick({ slug: category.slug, name: category.name }),
							children: ($$renderer) => {
								if (category.thumbnail) {
									$$renderer.push(`<!--[0--><img${$.attr('src', category.thumbnail)}${$.attr('alt', formattedCategoryName)} class="h-8 w-8 rounded object-cover transition-opacity group-hover:opacity-80"/>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> <span class="flex-1 py-0.5 capitalize text-gray-600 transition-colors group-hover:text-primary">${$.escape(formatCategoryName(category.name))}</span>`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="flex h-40 items-center justify-center"><p class="text-sm font-medium text-gray-400">No categories found</p></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else if (filterModule.selectedSection === 'price') {
				$$renderer.push(`<!--[2--><div class="w-full space-y-8"><p class="ed-mf__label text-xs font-bold uppercase tracking-widest text-gray-900 svelte-l2jkuf">Price Range</p> <div class="ed-mf__slider relative mr-5 mt-4 px-2"><div class="ed-mf__track absolute h-1 w-full rounded bg-gray-100 svelte-l2jkuf"><div class="ed-mf__fill absolute h-1 bg-primary svelte-l2jkuf"${$.attr_style(`left: ${$.stringify(filterModule.priceSliderLeftPercentage)}%; right: ${$.stringify(filterModule.priceSliderRightPercentage)}%`)}></div></div> <input type="range"${$.attr('value', filterModule.minPrice)}${$.attr('min', filterModule.minPossiblePrice)}${$.attr('max', filterModule.maxPossiblePrice)} class="pointer-events-none absolute h-1 w-full appearance-none bg-transparent [&amp;::-moz-range-thumb]:pointer-events-auto [&amp;::-moz-range-thumb]:h-5 [&amp;::-moz-range-thumb]:w-5 [&amp;::-moz-range-thumb]:cursor-pointer [&amp;::-moz-range-thumb]:appearance-none [&amp;::-moz-range-thumb]:rounded-full [&amp;::-moz-range-thumb]:border-2 [&amp;::-moz-range-thumb]:border-primary [&amp;::-moz-range-thumb]:bg-white [&amp;::-webkit-slider-thumb]:pointer-events-auto [&amp;::-webkit-slider-thumb]:h-5 [&amp;::-webkit-slider-thumb]:w-5 [&amp;::-webkit-slider-thumb]:cursor-pointer [&amp;::-webkit-slider-thumb]:appearance-none [&amp;::-webkit-slider-thumb]:rounded-full [&amp;::-webkit-slider-thumb]:border-2 [&amp;::-webkit-slider-thumb]:border-primary [&amp;::-webkit-slider-thumb]:bg-white"/> <input type="range"${$.attr('value', filterModule.maxPrice)}${$.attr('min', filterModule.minPossiblePrice)}${$.attr('max', filterModule.maxPossiblePrice)} class="pointer-events-none absolute h-1 w-full appearance-none bg-transparent [&amp;::-moz-range-thumb]:pointer-events-auto [&amp;::-moz-range-thumb]:h-5 [&amp;::-moz-range-thumb]:w-5 [&amp;::-moz-range-thumb]:cursor-pointer [&amp;::-moz-range-thumb]:appearance-none [&amp;::-moz-range-thumb]:rounded-full [&amp;::-moz-range-thumb]:border-2 [&amp;::-moz-range-thumb]:border-primary [&amp;::-moz-range-thumb]:bg-white [&amp;::-webkit-slider-thumb]:pointer-events-auto [&amp;::-webkit-slider-thumb]:h-5 [&amp;::-webkit-slider-thumb]:w-5 [&amp;::-webkit-slider-thumb]:cursor-pointer [&amp;::-webkit-slider-thumb]:appearance-none [&amp;::-webkit-slider-thumb]:rounded-full [&amp;::-webkit-slider-thumb]:border-2 [&amp;::-webkit-slider-thumb]:border-primary [&amp;::-webkit-slider-thumb]:bg-white"/></div> <div class="ed-mf__priceval pt-4 text-lg font-bold text-gray-900 svelte-l2jkuf">${$.escape(filterModule.priceRange)}</div></div>`);
			} else if (filterModule.selectedSection === 'tags') {
				$$renderer.push('<!--[3-->');

				if (filterModule.tags.length > 0) {
					$$renderer.push(`<!--[0--><div class="space-y-1"><!--[-->`);

					const each_array_4 = $.ensure_array_like(filterModule.tags);

					for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
						let tag = each_array_4[$$index_4];

						$$renderer.push(`<div class="flex flex-row items-center gap-3 border-b border-gray-50 py-2 last:border-0">`);

						Checkbox($$renderer, {
							id: `m-${tag.slug || tag.name}`,
							checked: filterModule.selectedTags?.find?.((t) => t?.name === tag?.name) ? true : false,
							onCheckedChange: (checked) => {
								filterModule.handleTagChange({ tag, checked });
							}
						});

						$$renderer.push(`<!----> <label${$.attr('for', `m-${tag.slug || tag.name}`)} class="ed-mf__opt flex-1 text-sm font-medium capitalize text-gray-700 svelte-l2jkuf">${$.escape(tag.name)}</label></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="flex h-40 items-center justify-center"><p class="text-sm font-medium text-gray-400">No tags found</p></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else if (filterModule.processedFilters) {
				$$renderer.push('<!--[4-->');

				const valuesToShow = filterModule.processedFilters[filterModule.selectedSection];

				$$renderer.push(`<div class="space-y-1"><!--[-->`);

				const each_array_5 = $.ensure_array_like(valuesToShow);

				for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
					let value = each_array_5[$$index_5];

					$$renderer.push(`<div class="flex items-center gap-3 border-b border-gray-50 py-2 last:border-0">`);

					Checkbox($$renderer, {
						id: `m-${value}`,
						checked: filterModule.selectedGeneralFilters[filterModule.selectedSection]?.includes(value),
						onCheckedChange: (checked) => filterModule.handleGeneralFiltersChange({ key: filterModule.selectedSection, value, checked })
					});

					$$renderer.push(`<!----> <label${$.attr('for', `m-${value}`)} class="ed-mf__opt text-sm font-medium capitalize text-gray-700 svelte-l2jkuf">`);

					if (value?.startsWith?.('#')) {
						$$renderer.push(`<!--[0--><div class="flex items-center gap-2"><div class="h-5 w-5 rounded-full border border-gray-100 shadow-sm"${$.attr_style(`background-color: ${$.stringify(value)};`)}></div> ${$.escape(GetColorName(value))}</div>`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(value)}`);
					}

					$$renderer.push(`<!--]--></label></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { selectedSort });
	});
}