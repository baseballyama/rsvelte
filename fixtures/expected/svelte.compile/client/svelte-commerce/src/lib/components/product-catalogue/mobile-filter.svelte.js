import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Drawer from '$lib/components/ui/drawer/index.js';
import { GetColorName } from 'hex-color-to-color-name';
import { ArrowDownNarrowWide, Filter, SearchIcon, X } from '@lucide/svelte';
import { fly } from 'svelte/transition';
import Button from '$lib/components/ui/button/button.svelte';
import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
import Input from '$lib/components/ui/input/input.svelte';
import { getDesktopFilterState } from '$lib/core/composables/index.js';
import { sortOptions } from '$lib/config.js';

var root = $.from_html(`<span class="text-xs text-gray-500"> </span>`);
var root_1 = $.from_html(`<!> <div class="flex flex-col items-start"><span class="font-semibold">Sort By</span> <!></div>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-between"><label> </label> <!></div>`);
var root_3 = $.from_html(`<!> <div class="space-y-3 px-4 py-3"></div>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<span class="truncate text-xs capitalize text-gray-500"> </span>`);
var root_6 = $.from_html(`<!> <div class="flex max-w-[50%] flex-col items-start"><span class="text-sm font-semibold text-gray-700">Filter</span> <div class="grid grid-cols-1"><!></div></div>`, 1);
var root_7 = $.from_html(`<!> <span class="sr-only">Close</span>`, 1);
var root_8 = $.from_html(`<div class="h-4 w-px bg-gray-200"></div> <!>`, 1);
var root_9 = $.from_html(`<span class="text-[10px] text-primary"> </span>`);
var root_10 = $.from_html(`<span class="text-left text-[11px] font-bold uppercase tracking-widest"> </span> <!>`, 1);
var root_11 = $.from_html(`<label class="group flex cursor-pointer items-center gap-3"><div class="relative flex items-center justify-center"><input type="radio" name="discount" class="peer h-5 w-5 appearance-none rounded-full border-2 border-gray-200 transition-all checked:border-primary"/> <div class="absolute h-2.5 w-2.5 rounded-full bg-primary opacity-0 transition-opacity peer-checked:opacity-100"></div></div> <span class="ed-mf__opt text-sm font-medium text-gray-700 transition-colors group-hover:text-primary svelte-l2jkuf"> </span></label>`);
var root_12 = $.from_html(`<div class="space-y-6"><div class="relative"><input type="text" placeholder="Search discount..." class="ed-mf__search w-full rounded-md border-0 bg-gray-100 py-2.5 pl-4 pr-10 text-sm ring-0 transition-all focus:ring-2 focus:ring-primary svelte-l2jkuf"/> <!></div> <div class="space-y-3"></div></div>`);
var root_13 = $.from_html(`<img class="h-8 w-8 rounded object-cover transition-opacity group-hover:opacity-80"/>`);
var root_14 = $.from_html(`<!> <span class="flex-1 py-0.5 capitalize text-gray-600 transition-colors group-hover:text-primary"> </span>`, 1);
var root_15 = $.from_html(`<div class="space-y-4"></div>`);
var root_16 = $.from_html(`<div class="flex h-40 items-center justify-center"><p class="text-sm font-medium text-gray-400">No categories found</p></div>`);
var root_17 = $.from_html(`<div class="relative mb-6"><input type="text" placeholder="Search category..." class="w-full rounded-md border-0 bg-gray-100 py-2.5 pl-4 pr-10 text-sm ring-0 transition-all focus:ring-2 focus:ring-primary"/> <!></div> <!>`, 1);
var root_18 = $.from_html(`<div class="w-full space-y-8"><p class="ed-mf__label text-xs font-bold uppercase tracking-widest text-gray-900 svelte-l2jkuf">Price Range</p> <div class="ed-mf__slider relative mr-5 mt-4 px-2"><div class="ed-mf__track absolute h-1 w-full rounded bg-gray-100 svelte-l2jkuf"><div class="ed-mf__fill absolute h-1 bg-primary svelte-l2jkuf"></div></div> <input type="range" class="pointer-events-none absolute h-1 w-full appearance-none bg-transparent [&amp;::-moz-range-thumb]:pointer-events-auto [&amp;::-moz-range-thumb]:h-5 [&amp;::-moz-range-thumb]:w-5 [&amp;::-moz-range-thumb]:cursor-pointer [&amp;::-moz-range-thumb]:appearance-none [&amp;::-moz-range-thumb]:rounded-full [&amp;::-moz-range-thumb]:border-2 [&amp;::-moz-range-thumb]:border-primary [&amp;::-moz-range-thumb]:bg-white [&amp;::-webkit-slider-thumb]:pointer-events-auto [&amp;::-webkit-slider-thumb]:h-5 [&amp;::-webkit-slider-thumb]:w-5 [&amp;::-webkit-slider-thumb]:cursor-pointer [&amp;::-webkit-slider-thumb]:appearance-none [&amp;::-webkit-slider-thumb]:rounded-full [&amp;::-webkit-slider-thumb]:border-2 [&amp;::-webkit-slider-thumb]:border-primary [&amp;::-webkit-slider-thumb]:bg-white"/> <input type="range" class="pointer-events-none absolute h-1 w-full appearance-none bg-transparent [&amp;::-moz-range-thumb]:pointer-events-auto [&amp;::-moz-range-thumb]:h-5 [&amp;::-moz-range-thumb]:w-5 [&amp;::-moz-range-thumb]:cursor-pointer [&amp;::-moz-range-thumb]:appearance-none [&amp;::-moz-range-thumb]:rounded-full [&amp;::-moz-range-thumb]:border-2 [&amp;::-moz-range-thumb]:border-primary [&amp;::-moz-range-thumb]:bg-white [&amp;::-webkit-slider-thumb]:pointer-events-auto [&amp;::-webkit-slider-thumb]:h-5 [&amp;::-webkit-slider-thumb]:w-5 [&amp;::-webkit-slider-thumb]:cursor-pointer [&amp;::-webkit-slider-thumb]:appearance-none [&amp;::-webkit-slider-thumb]:rounded-full [&amp;::-webkit-slider-thumb]:border-2 [&amp;::-webkit-slider-thumb]:border-primary [&amp;::-webkit-slider-thumb]:bg-white"/></div> <div class="ed-mf__priceval pt-4 text-lg font-bold text-gray-900 svelte-l2jkuf"> </div></div>`);
var root_19 = $.from_html(`<div class="flex flex-row items-center gap-3 border-b border-gray-50 py-2 last:border-0"><!> <label class="ed-mf__opt flex-1 text-sm font-medium capitalize text-gray-700 svelte-l2jkuf"> </label></div>`);
var root_20 = $.from_html(`<div class="space-y-1"></div>`);
var root_21 = $.from_html(`<div class="flex h-40 items-center justify-center"><p class="text-sm font-medium text-gray-400">No tags found</p></div>`);
var root_22 = $.from_html(`<div class="flex items-center gap-2"><div class="h-5 w-5 rounded-full border border-gray-100 shadow-sm"></div> </div>`);
var root_23 = $.from_html(`<div class="flex items-center gap-3 border-b border-gray-50 py-2 last:border-0"><!> <label class="ed-mf__opt text-sm font-medium capitalize text-gray-700 svelte-l2jkuf"><!></label></div>`);
var root_24 = $.from_html(`<div class="ed-mf__bar fixed bottom-0 left-0 right-0 z-40 grid h-12 w-full grid-cols-2 border-t border-gray-200 bg-white shadow-md md:hidden svelte-l2jkuf"><div class="flex items-center justify-center border-r border-gray-200"><!></div> <div class="flex flex-col items-center justify-center bg-white transition hover:bg-gray-50"><!></div></div> <div><div class="flex h-full flex-col"><div class="ed-mf__phead flex items-center justify-between border-b border-gray-100 !p-3 svelte-l2jkuf"><div class="flex w-full items-center justify-between gap-4"><div class="flex items-center justify-center gap-3"><!> <!></div> <h2 class="ed-mf__ptitle text-xs font-bold uppercase tracking-widest text-gray-900 svelte-l2jkuf">Filters</h2> <!></div></div> <div class="flex flex-1 flex-col overflow-hidden"><div class="flex h-full"><div class="ed-mf__menu w-[35vw] overflow-y-auto bg-gray-50 svelte-l2jkuf"></div> <div class="ed-mf__content flex-1 overflow-y-auto bg-white p-4"><!></div></div></div></div></div>`, 1);

export default function Mobile_filter($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	let onSortChange = $.prop($$props, 'onSortChange', 3, (value) => {});
	const filterModule = getDesktopFilterState();

	function formatCategoryName(input) {
		const x = filterModule.formatFilterOptionName(input);

		if (x.length > 27) return x.substring(0, 24) + '...';

		return x;
	}

	var fragment = root_24();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.component(node, () => Drawer.Root, ($$anchor, Drawer_Root) => {
		Drawer_Root($$anchor, {
			direction: 'bottom',
			get open() {
				return filterModule.showSortByDrawer;
			},

			set open($$value) {
				filterModule.showSortByDrawer = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
					Drawer_Trigger($$anchor, {
						class: 'flex h-full w-full items-center justify-center gap-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							ArrowDownNarrowWide(node_2, { class: 'h-4 w-4 text-gray-500' });

							var div_2 = $.sibling(node_2, 2);
							var node_3 = $.sibling($.child(div_2), 2);

							{
								var consequent = ($$anchor) => {
									var span = root();
									var text = $.only_child(span, true);

									$.template_effect(($0) => $.set_text(text, $0), [
										() => sortOptions.find((item) => item.value === $$props.selectedSort)?.name
									]);

									$.append($$anchor, span);
								};

								$.if(node_3, ($$render) => {
									if ($$props.selectedSort) $$render(consequent);
								});
							}

							$.reset(div_2);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Drawer.Content, ($$anchor, Drawer_Content) => {
					Drawer_Content($$anchor, {
						class: 'rounded-t-xl',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_3();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Drawer.Header, ($$anchor, Drawer_Header) => {
								Drawer_Header($$anchor, {
									class: 'border-b border-gray-100 py-3 text-left',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Drawer.Title, ($$anchor, Drawer_Title) => {
											Drawer_Title($$anchor, {
												class: 'text-base font-semibold',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Sort By');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var div_3 = $.sibling(node_5, 2);

							$.each(div_3, 21, () => sortOptions, $.index, ($$anchor, item) => {
								var div_4 = root_2();
								var label = $.child(div_4);
								var text_2 = $.only_child(label, true);
								var node_7 = $.sibling(label, 2);

								{
									let $0 = $.derived(() => filterModule.selectedSort === $.get(item).value);

									Input(node_7, {
										class: '!h-4 !w-4 border-gray-300 text-primary focus:ring-primary',
										get id() {
											return $.get(item).value;
										},
										type: 'radio',
										name: 'sort',
										get value() {
											return $.get(item).value;
										},

										get checked() {
											return $.get($0);
										},

										onchange: () => {
											filterModule.selectedSort = $.get(item).value;
											onSortChange()?.($.get(item).value);
											filterModule.showSortByDrawer = false;
										}
									});
								}

								$.reset(div_4);

								$.template_effect(() => {
									$.set_attribute(label, 'for', $.get(item).value);

									$.set_class(label, 1, `w-full text-left text-sm ${$$props.selectedSort === $.get(item).value
										? 'font-medium text-primary'
										: 'font-normal text-gray-700'}`);

									$.set_text(text_2, $.get(item).name);
								});

								$.append($$anchor, div_4);
							});

							$.reset(div_3);
							$.transition(1, div_3, () => fly, () => ({ y: 0, duration: 200, delay: 0 }));
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var node_8 = $.child(div_5);

	Button(node_8, {
		variant: 'ghost',
		class: 'flex h-full w-full items-center justify-center rounded-none p-0 hover:bg-transparent',
		onclick: () => {
			filterModule.showFilter = true;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_6();
			var node_9 = $.first_child(fragment_5);

			Filter(node_9, { class: 'mx-2 max-h-4 min-h-4 min-w-4 max-w-4 text-gray-500' });

			var div_6 = $.sibling(node_9, 2);
			var div_7 = $.sibling($.child(div_6), 2);
			var node_10 = $.child(div_7);

			{
				var consequent_1 = ($$anchor) => {
					var span_1 = root_5();
					var text_3 = $.only_child(span_1, true);

					$.template_effect(($0) => $.set_text(text_3, $0), [
						() => Object.keys(filterModule.appliedFiltersCountByKey)?.splice?.(0, 2)?.map((k) => k?.includes('attributes') || k?.includes('option') ? k.split('.')?.[1] : k)?.join?.(', ') + (Object.keys(filterModule.appliedFiltersCountByKey)?.length > 2
							? ` +${Object.keys(filterModule.appliedFiltersCountByKey)?.length - 2}`
							: '')
					]);

					$.append($$anchor, span_1);
				};

				$.if(node_10, ($$render) => {
					if (filterModule.anyFilterApplied) $$render(consequent_1);
				});
			}

			$.reset(div_7);
			$.reset(div_6);
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);
	$.reset(div);

	var div_8 = $.sibling(div, 2);
	var div_9 = $.child(div_8);
	var div_10 = $.child(div_9);
	var div_11 = $.child(div_10);
	var div_12 = $.child(div_11);
	var node_11 = $.child(div_12);

	Button(node_11, {
		variant: 'ghost',
		size: 'icon',
		class: 'rounded-full',
		onclick: () => filterModule.showFilter = false,
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_7();
			var node_12 = $.first_child(fragment_6);

			X(node_12, { class: 'h-6 w-6 text-gray-900' });
			$.next(2);
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_11, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_7 = root_8();
			var node_14 = $.sibling($.first_child(fragment_7), 2);

			Button(node_14, {
				variant: 'link',
				size: 'sm',
				class: 'ed-mf__clear h-auto p-0',
				get onclick() {
					return filterModule.clearFilters;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Clear All');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_7);
		};

		$.if(node_13, ($$render) => {
			if (filterModule.anyFilterApplied) $$render(consequent_2);
		});
	}

	$.reset(div_12);

	var node_15 = $.sibling(div_12, 4);

	Button(node_15, {
		variant: 'default',
		class: 'ed-mf__apply h-9 bg-primary px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-black',
		get onclick() {
			return filterModule.handleApply;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Apply');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_11);
	$.reset(div_10);

	var div_13 = $.sibling(div_10, 2);
	var div_14 = $.child(div_13);
	var div_15 = $.child(div_14);

	$.each(div_15, 21, () => filterModule.menuItems, $.index, ($$anchor, item) => {
		{
			let $0 = $.derived(() => filterModule.selectedSection === $.get(item).id
				? 'border-primary bg-white text-primary hover:bg-white'
				: 'border-transparent text-gray-500 hover:bg-gray-100');

			Button($$anchor, {
				variant: 'ghost',
				get class() {
					return `ed-mf__tab h-auto w-full justify-between rounded-none border-l-4 px-4 py-4 ${$.get($0) ?? ''}`;
				},
				onclick: () => filterModule.selectedSection = $.get(item).id,
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_10();
					var span_2 = $.first_child(fragment_9);
					var text_6 = $.only_child(span_2, true);
					var node_16 = $.sibling(span_2, 2);

					{
						var consequent_3 = ($$anchor) => {
							var span_3 = root_9();
							var text_7 = $.only_child(span_3);

							$.template_effect(() => $.set_text(text_7, `(${filterModule.appliedFiltersCountByKey[$.get(item).id] ?? ''})`));
							$.append($$anchor, span_3);
						};

						$.if(node_16, ($$render) => {
							if (filterModule.appliedFiltersCountByKey[$.get(item).id]) $$render(consequent_3);
						});
					}

					$.template_effect(($0) => $.set_text(text_6, $0), [() => filterModule.formatFilterName($.get(item).label)]);
					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});
		}
	});

	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var node_17 = $.child(div_16);

	{
		var consequent_4 = ($$anchor) => {
			var div_17 = root_12();
			var div_18 = $.child(div_17);
			var input_1 = $.child(div_18);

			$.remove_input_defaults(input_1);

			var node_18 = $.sibling(input_1, 2);

			SearchIcon(node_18, {
				class: 'absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
			});

			$.reset(div_18);

			var div_19 = $.sibling(div_18, 2);

			$.each(div_19, 21, () => filterModule.discountOptions, $.index, ($$anchor, option) => {
				var label_1 = root_11();
				var div_20 = $.child(label_1);
				var input_2 = $.child(div_20);

				$.remove_input_defaults(input_2);

				var input_2_value;

				$.next(2);
				$.reset(div_20);

				var span_4 = $.sibling(div_20, 2);
				var text_8 = $.only_child(span_4, true);

				$.reset(label_1);

				$.template_effect(() => {
					if (input_2_value !== (input_2_value = $.get(option).value)) {
						input_2.value = (input_2.__value = input_2_value) ?? '';
					}

					$.set_text(text_8, $.get(option).label);
				});

				$.bind_group(
					binding_group,
					[],
					input_2,
					() => {
						$.get(option).value;

						return filterModule.selectedDiscount;
					},
					($$value) => filterModule.selectedDiscount = $$value
				);

				$.append($$anchor, label_1);
			});

			$.reset(div_19);
			$.reset(div_17);
			$.bind_value(input_1, () => filterModule.searchQuery, ($$value) => filterModule.searchQuery = $$value);
			$.append($$anchor, div_17);
		};

		var consequent_7 = ($$anchor) => {
			var fragment_10 = root_17();
			var div_21 = $.first_child(fragment_10);
			var input_3 = $.child(div_21);

			$.remove_input_defaults(input_3);

			var node_19 = $.sibling(input_3, 2);

			SearchIcon(node_19, {
				class: 'absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
			});

			$.reset(div_21);

			var node_20 = $.sibling(div_21, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_22 = root_15();

					$.each(div_22, 21, () => filterModule.filteredCategories, $.index, ($$anchor, category) => {
						const formattedCategoryName = $.derived(() => filterModule.formatFilterOptionName($.get(category).name));

						Button($$anchor, {
							variant: 'link',
							get title() {
								return $.get(formattedCategoryName);
							},
							class: 'group h-auto gap-2 overflow-hidden text-ellipsis whitespace-nowrap px-0 py-1 text-start hover:bg-transparent',
							onclick: () => filterModule.handleCategoryClick({ slug: $.get(category).slug, name: $.get(category).name }),
							children: ($$anchor, $$slotProps) => {
								var fragment_12 = root_14();
								var node_21 = $.first_child(fragment_12);

								{
									var consequent_5 = ($$anchor) => {
										var img = root_13();

										$.template_effect(() => {
											$.set_attribute(img, 'src', $.get(category).thumbnail);
											$.set_attribute(img, 'alt', $.get(formattedCategoryName));
										});

										$.append($$anchor, img);
									};

									$.if(node_21, ($$render) => {
										if ($.get(category).thumbnail) $$render(consequent_5);
									});
								}

								var span_5 = $.sibling(node_21, 2);
								var text_9 = $.only_child(span_5, true);

								$.template_effect(($0) => $.set_text(text_9, $0), [() => formatCategoryName($.get(category).name)]);
								$.append($$anchor, fragment_12);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_22);
					$.append($$anchor, div_22);
				};

				var alternate = ($$anchor) => {
					var div_23 = root_16();

					$.append($$anchor, div_23);
				};

				$.if(node_20, ($$render) => {
					if (filterModule.filteredCategories?.length > 0) $$render(consequent_6); else $$render(alternate, -1);
				});
			}

			$.bind_value(input_3, () => filterModule.categorySearchQuery, ($$value) => filterModule.categorySearchQuery = $$value);
			$.append($$anchor, fragment_10);
		};

		var consequent_8 = ($$anchor) => {
			var div_24 = root_18();
			var div_25 = $.sibling($.child(div_24), 2);
			var div_26 = $.child(div_25);
			var div_27 = $.only_child(div_26);
			var input_4 = $.sibling(div_26, 2);

			$.remove_input_defaults(input_4);

			var input_5 = $.sibling(input_4, 2);

			$.remove_input_defaults(input_5);
			$.reset(div_25);

			var div_28 = $.sibling(div_25, 2);
			var text_10 = $.only_child(div_28, true);

			$.reset(div_24);

			$.template_effect(() => {
				$.set_style(div_27, `left: ${filterModule.priceSliderLeftPercentage ?? ''}%; right: ${filterModule.priceSliderRightPercentage ?? ''}%`);
				$.set_attribute(input_4, 'min', filterModule.minPossiblePrice);
				$.set_attribute(input_4, 'max', filterModule.maxPossiblePrice);
				$.set_attribute(input_5, 'min', filterModule.minPossiblePrice);
				$.set_attribute(input_5, 'max', filterModule.maxPossiblePrice);
				$.set_text(text_10, filterModule.priceRange);
			});

			$.delegated('change', input_4, function (...$$args) {
				filterModule.handleMinPriceChange?.apply(this, $$args);
			});

			$.bind_value(input_4, () => filterModule.minPrice, ($$value) => filterModule.minPrice = $$value);

			$.delegated('change', input_5, function (...$$args) {
				filterModule.handleMaxPriceChange?.apply(this, $$args);
			});

			$.bind_value(input_5, () => filterModule.maxPrice, ($$value) => filterModule.maxPrice = $$value);
			$.append($$anchor, div_24);
		};

		var consequent_10 = ($$anchor) => {
			var fragment_13 = $.comment();
			var node_22 = $.first_child(fragment_13);

			{
				var consequent_9 = ($$anchor) => {
					var div_29 = root_20();

					$.each(div_29, 21, () => filterModule.tags, $.index, ($$anchor, tag) => {
						var div_30 = root_19();
						var node_23 = $.child(div_30);

						{
							let $0 = $.derived(() => `m-${$.get(tag).slug || $.get(tag).name}`);
							let $1 = $.derived(() => filterModule.selectedTags?.find?.((t) => t?.name === $.get(tag)?.name) ? true : false);

							Checkbox(node_23, {
								get id() {
									return $.get($0);
								},

								get checked() {
									return $.get($1);
								},

								onCheckedChange: (checked) => {
									filterModule.handleTagChange({ tag: $.get(tag), checked });
								}
							});
						}

						var label_2 = $.sibling(node_23, 2);
						var text_11 = $.only_child(label_2, true);

						$.reset(div_30);

						$.template_effect(() => {
							$.set_attribute(label_2, 'for', `m-${$.get(tag).slug || $.get(tag).name}`);
							$.set_text(text_11, $.get(tag).name);
						});

						$.append($$anchor, div_30);
					});

					$.reset(div_29);
					$.append($$anchor, div_29);
				};

				var alternate_1 = ($$anchor) => {
					var div_31 = root_21();

					$.append($$anchor, div_31);
				};

				$.if(node_22, ($$render) => {
					if (filterModule.tags.length > 0) $$render(consequent_9); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_13);
		};

		var consequent_12 = ($$anchor) => {
			const valuesToShow = $.derived(() => filterModule.processedFilters[filterModule.selectedSection]);
			var div_32 = root_20();

			$.each(div_32, 21, () => $.get(valuesToShow), $.index, ($$anchor, value) => {
				var div_33 = root_23();
				var node_24 = $.child(div_33);

				{
					let $0 = $.derived(() => `m-${$.get(value)}`);
					let $1 = $.derived(() => filterModule.selectedGeneralFilters[filterModule.selectedSection]?.includes($.get(value)));

					Checkbox(node_24, {
						get id() {
							return $.get($0);
						},

						get checked() {
							return $.get($1);
						},

						onCheckedChange: (checked) => filterModule.handleGeneralFiltersChange({
							key: filterModule.selectedSection,
							value: $.get(value),
							checked
						})
					});
				}

				var label_3 = $.sibling(node_24, 2);
				var node_25 = $.child(label_3);

				{
					var consequent_11 = ($$anchor) => {
						var div_34 = root_22();
						var div_35 = $.child(div_34);
						var text_12 = $.sibling(div_35);

						$.reset(div_34);

						$.template_effect(
							($0) => {
								$.set_style(div_35, `background-color: ${$.get(value) ?? ''};`);
								$.set_text(text_12, ` ${$0 ?? ''}`);
							},
							[() => GetColorName($.get(value))]
						);

						$.append($$anchor, div_34);
					};

					var d = $.derived(() => $.get(value)?.startsWith?.('#'));

					var alternate_2 = ($$anchor) => {
						var text_13 = $.text();

						$.template_effect(() => $.set_text(text_13, $.get(value)));
						$.append($$anchor, text_13);
					};

					$.if(node_25, ($$render) => {
						if ($.get(d)) $$render(consequent_11); else $$render(alternate_2, -1);
					});
				}

				$.reset(label_3);
				$.reset(div_33);
				$.template_effect(() => $.set_attribute(label_3, 'for', `m-${$.get(value)}`));
				$.append($$anchor, div_33);
			});

			$.reset(div_32);
			$.append($$anchor, div_32);
		};

		$.if(node_17, ($$render) => {
			if (filterModule.selectedSection === 'discount') $$render(consequent_4); else if (filterModule.selectedSection === 'category') $$render(consequent_7, 1); else if (filterModule.selectedSection === 'price') $$render(consequent_8, 2); else if (filterModule.selectedSection === 'tags') $$render(consequent_10, 3); else if (filterModule.processedFilters) $$render(consequent_12, 4);
		});
	}

	$.reset(div_16);
	$.reset(div_14);
	$.reset(div_13);
	$.reset(div_9);
	$.reset(div_8);

	$.template_effect(() => {
		$.set_class(div_8, 1, `ed-mf__panel fixed inset-0 z-[1000] h-screen w-screen ${filterModule.showFilter ? 'translate-x-0' : '-translate-x-full'} transform bg-white transition-transform`, 'svelte-l2jkuf');
		div_8.inert = !filterModule.showFilter;
		$.set_attribute(div_8, 'aria-hidden', !filterModule.showFilter);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['change']);