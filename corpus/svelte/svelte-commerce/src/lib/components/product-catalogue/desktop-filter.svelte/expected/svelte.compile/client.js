import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> Clear`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">Close search</span>`, 1);
var root_2 = $.from_html(`<div class="relative mx-auto w-[calc(100%-0.5rem)]"><input type="text" placeholder="Search categories" class="ed-df__search w-full rounded-md border-0 py-2 pl-3 text-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-primary svelte-1xbwik7"/> <!></div>`);
var root_3 = $.from_html(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg> <span class="sr-only">Search</span>`, 1);
var root_4 = $.from_html(`<div class="flex items-center justify-between"><p class="ed-df__label text-sm font-bold uppercase text-gray-900 svelte-1xbwik7">Categories</p> <!></div>`);
var root_5 = $.from_html(`<img class="h-8 w-8 rounded object-cover transition-opacity group-hover:opacity-80"/>`);
var root_6 = $.from_html(`<!> <span class="ed-df__cat flex-1 py-0.5 capitalize text-gray-600 transition-colors group-hover:text-primary svelte-1xbwik7"> </span>`, 1);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<!> <div class="flex flex-col items-start justify-start text-sm"><!></div>`, 1);
var root_9 = $.from_html(`<div class="relative mx-auto w-[calc(100%-0.5rem)]"><input type="text" placeholder="Search tags" class="ed-df__search w-full rounded-md border-0 py-2 pl-3 text-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-primary svelte-1xbwik7"/> <!></div>`);
var root_10 = $.from_html(`<div class="flex items-center justify-between"><p class="ed-df__label text-sm font-bold uppercase text-gray-900 svelte-1xbwik7">Tags</p> <!></div>`);
var root_11 = $.from_html(`<div class="flex flex-row items-center gap-2"><!> <label class="ed-df__opt flex-1 cursor-pointer py-1 capitalize text-gray-600 transition-colors hover:text-gray-900 svelte-1xbwik7"> </label></div>`);
var root_12 = $.from_html(`<div class="ed-df__rule w-full border-b border-gray-200 svelte-1xbwik7"></div> <!> <div class="flex flex-col text-sm"><!></div> <div class="ed-df__rule w-full border-b border-gray-200 svelte-1xbwik7"></div>`, 1);
var root_13 = $.from_html(`<div class="flex items-center gap-2"><div class="h-4 w-4 rounded-full border border-gray-200"></div> </div>`);
var root_14 = $.from_html(`<div class="flex flex-row items-center gap-2"><!> <label class="ed-df__opt flex-1 cursor-pointer py-1 capitalize text-gray-600 transition-colors hover:text-gray-900 svelte-1xbwik7"><!></label></div>`);
var root_15 = $.from_html(`<div class="ed-df__rule w-full border-b border-gray-200 svelte-1xbwik7"></div> <div class="intra-gap flex flex-col"><p class="ed-df__label text-sm font-bold uppercase text-gray-900 svelte-1xbwik7"> </p> <div class="flex flex-col space-y-1 text-sm"><!></div></div>`, 1);
var root_16 = $.from_html(`<div class="ed-df group sticky"><div><div class="flex items-center justify-between"><p class="ed-df__title text-lg font-bold svelte-1xbwik7">Filters</p> <!></div> <div class="ed-df__rule w-full border-b border-gray-200 svelte-1xbwik7"></div>  <!> <!> <p class="ed-df__label text-sm font-bold uppercase text-gray-900 svelte-1xbwik7">Price Range</p> <div class="ed-df__slider relative mr-5 mt-2"><div class="ed-df__track absolute h-1 w-full rounded bg-gray-100 svelte-1xbwik7"><div class="ed-df__fill absolute h-1 bg-primary svelte-1xbwik7"></div></div> <input type="range" aria-label="Choose minimum price" class="pointer-events-none absolute h-1 w-full appearance-none bg-transparent [&amp;::-moz-range-thumb]:pointer-events-auto [&amp;::-moz-range-thumb]:h-4 [&amp;::-moz-range-thumb]:w-4 [&amp;::-moz-range-thumb]:cursor-pointer [&amp;::-moz-range-thumb]:appearance-none [&amp;::-moz-range-thumb]:rounded-full [&amp;::-moz-range-thumb]:border-2 [&amp;::-moz-range-thumb]:border-primary [&amp;::-moz-range-thumb]:bg-white [&amp;::-moz-range-thumb]:ring-1 [&amp;::-moz-range-thumb]:ring-black [&amp;::-webkit-slider-thumb]:pointer-events-auto [&amp;::-webkit-slider-thumb]:h-4 [&amp;::-webkit-slider-thumb]:w-4 [&amp;::-webkit-slider-thumb]:cursor-pointer [&amp;::-webkit-slider-thumb]:appearance-none [&amp;::-webkit-slider-thumb]:rounded-full [&amp;::-webkit-slider-thumb]:border-2 [&amp;::-webkit-slider-thumb]:border-primary [&amp;::-webkit-slider-thumb]:bg-white [&amp;::-webkit-slider-thumb]:ring-1 [&amp;::-webkit-slider-thumb]:ring-gray-300"/> <input type="range" aria-label="Choose maximum price" class="pointer-events-none absolute h-1 w-full appearance-none bg-transparent [&amp;::-moz-range-thumb]:pointer-events-auto [&amp;::-moz-range-thumb]:h-4 [&amp;::-moz-range-thumb]:w-4 [&amp;::-moz-range-thumb]:cursor-pointer [&amp;::-moz-range-thumb]:appearance-none [&amp;::-moz-range-thumb]:rounded-full [&amp;::-moz-range-thumb]:border-2 [&amp;::-moz-range-thumb]:border-primary [&amp;::-moz-range-thumb]:bg-white [&amp;::-moz-range-thumb]:ring-1 [&amp;::-moz-range-thumb]:ring-black [&amp;::-webkit-slider-thumb]:pointer-events-auto [&amp;::-webkit-slider-thumb]:h-4 [&amp;::-webkit-slider-thumb]:w-4 [&amp;::-webkit-slider-thumb]:cursor-pointer [&amp;::-webkit-slider-thumb]:appearance-none [&amp;::-webkit-slider-thumb]:rounded-full [&amp;::-webkit-slider-thumb]:border-2 [&amp;::-webkit-slider-thumb]:border-primary [&amp;::-webkit-slider-thumb]:bg-white [&amp;::-webkit-slider-thumb]:ring-1 [&amp;::-webkit-slider-thumb]:ring-gray-300"/></div> <div class="ed-df__prices mt-4 grid grid-cols-2 gap-3"><!> <!></div> <!></div></div>`);

export default function Desktop_filter($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, '');
	const filterState = getDesktopFilterState();

	function formatCategoryName(input) {
		const x = filterState.formatFilterOptionName(input);

		if (x.length > 27) return x.substring(0, 24) + '...';

		return x;
	}

	var div = root_16();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.sibling($.child(div_2), 2);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				variant: 'link',
				size: 'sm',
				class: 'ed-df__clear h-auto p-0',
				get onclick() {
					return filterState.clearFilters;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					X(node_1, { class: 'mr-1 h-3 w-3' });
					$.next();
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (filterState.anyFilterApplied) $$render(consequent);
		});
	}

	$.reset(div_2);

	var node_2 = $.sibling(div_2, 4);

	{
		var consequent_6 = ($$anchor) => {
			var fragment_2 = root_8();
			var node_3 = $.first_child(fragment_2);

			{
				var consequent_1 = ($$anchor) => {
					var div_3 = root_2();
					var input_1 = $.child(div_3);

					$.remove_input_defaults(input_1);
					$.autofocus(input_1, true);

					var node_4 = $.sibling(input_1, 2);

					Button(node_4, {
						variant: 'ghost',
						size: 'icon',
						class: 'absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full',
						onclick: () => filterState.toggleCategorySearch(),
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_5 = $.first_child(fragment_3);

							X(node_5, { class: 'h-4 w-4' });
							$.next(2);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.reset(div_3);

					$.delegated('keydown', input_1, function (...$$args) {
						filterState.handleCategorySearchKeyDown?.apply(this, $$args);
					});

					$.bind_value(input_1, () => filterState.categorySearchQuery, ($$value) => filterState.categorySearchQuery = $$value);
					$.transition(1, div_3, () => fly, () => ({ x: 10, duration: 200, easing: quintOut }));
					$.append($$anchor, div_3);
				};

				var alternate = ($$anchor) => {
					var div_4 = root_4();
					var p = $.child(div_4);
					var node_6 = $.sibling(p, 2);

					Button(node_6, {
						variant: 'ghost',
						size: 'icon',
						class: 'h-8 w-8 rounded-full',
						onclick: () => filterState.toggleCategorySearch(),
						'aria-label': 'Toggle category search',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_3();

							$.next(2);
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					$.reset(div_4);
					$.transition(1, p, () => fade, () => ({ duration: 200, delay: 200 }));
					$.append($$anchor, div_4);
				};

				$.if(node_3, ($$render) => {
					if (filterState.showCategorySearch) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			var div_5 = $.sibling(node_3, 2);
			var node_7 = $.child(div_5);

			{
				var consequent_4 = ($$anchor) => {
					const categoriesToShow = $.derived(() => filterState.filteredCategories.slice(0, 5));
					var fragment_5 = root_7();
					var node_8 = $.first_child(fragment_5);

					$.each(node_8, 17, () => $.get(categoriesToShow), $.index, ($$anchor, category) => {
						const formattedCategoryName = $.derived(() => filterState.formatFilterOptionName($.get(category).name));

						Button($$anchor, {
							variant: 'link',
							get title() {
								return $.get(formattedCategoryName);
							},
							class: 'group h-auto gap-2 overflow-hidden text-ellipsis whitespace-nowrap px-0 py-1 text-start hover:bg-transparent',
							onclick: () => filterState.handleCategoryClick({ slug: $.get(category).slug, name: $.get(category).name }),
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root_6();
								var node_9 = $.first_child(fragment_7);

								{
									var consequent_2 = ($$anchor) => {
										var img = root_5();

										$.template_effect(() => {
											$.set_attribute(img, 'src', $.get(category).thumbnail);
											$.set_attribute(img, 'alt', $.get(formattedCategoryName));
										});

										$.append($$anchor, img);
									};

									$.if(node_9, ($$render) => {
										if ($.get(category).thumbnail) $$render(consequent_2);
									});
								}

								var span = $.sibling(node_9, 2);
								var text = $.only_child(span, true);

								$.template_effect(($0) => $.set_text(text, $0), [() => formatCategoryName($.get(category).name)]);
								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					var node_10 = $.sibling(node_8, 2);

					{
						var consequent_3 = ($$anchor) => {
							Button($$anchor, {
								variant: 'link',
								size: 'sm',
								class: 'ed-df__more mt-1 h-auto justify-start p-0',
								get onclick() {
									return filterState.toggleShowMoreCategories;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, `+ ${filterState.filteredCategories.length - 5} more`));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_10, ($$render) => {
							if (filterState.filteredCategories.length > 5) $$render(consequent_3);
						});
					}

					$.append($$anchor, fragment_5);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_10 = root_7();
					var node_11 = $.first_child(fragment_10);

					$.each(node_11, 17, () => filterState.filteredCategories, $.index, ($$anchor, category) => {
						const formattedCategoryName = $.derived(() => filterState.formatFilterOptionName($.get(category).name));

						Button($$anchor, {
							variant: 'link',
							get title() {
								return $.get(formattedCategoryName);
							},
							class: 'group h-auto gap-2 overflow-hidden text-ellipsis whitespace-nowrap px-0 py-1 text-start hover:bg-transparent',
							onclick: () => filterState.handleCategoryClick({ slug: $.get(category).slug, name: $.get(category).name }),
							children: ($$anchor, $$slotProps) => {
								var fragment_12 = root_6();
								var node_12 = $.first_child(fragment_12);

								{
									var consequent_5 = ($$anchor) => {
										var img_1 = root_5();

										$.template_effect(() => {
											$.set_attribute(img_1, 'src', $.get(category).thumbnail);
											$.set_attribute(img_1, 'alt', $.get(formattedCategoryName));
										});

										$.append($$anchor, img_1);
									};

									$.if(node_12, ($$render) => {
										if ($.get(category).thumbnail) $$render(consequent_5);
									});
								}

								var span_1 = $.sibling(node_12, 2);
								var text_2 = $.only_child(span_1, true);

								$.template_effect(($0) => $.set_text(text_2, $0), [() => formatCategoryName($.get(category).name)]);
								$.append($$anchor, fragment_12);
							},
							$$slots: { default: true }
						});
					});

					var node_13 = $.sibling(node_11, 2);

					Button(node_13, {
						variant: 'link',
						size: 'sm',
						class: 'ed-df__more mt-1 h-auto justify-start p-0',
						get onclick() {
							return filterState.toggleShowMoreCategories;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Show less');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				};

				$.if(node_7, ($$render) => {
					if (!filterState.showMoreCategories) $$render(consequent_4); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_5);
			$.append($$anchor, fragment_2);
		};

		$.if(node_2, ($$render) => {
			if (filterState.categories.length > 0) $$render(consequent_6);
		});
	}

	var node_14 = $.sibling(node_2, 2);

	{
		var consequent_10 = ($$anchor) => {
			var fragment_13 = root_12();
			var node_15 = $.sibling($.first_child(fragment_13), 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_6 = root_9();
					var input_2 = $.child(div_6);

					$.remove_input_defaults(input_2);
					$.autofocus(input_2, true);

					var node_16 = $.sibling(input_2, 2);

					Button(node_16, {
						variant: 'ghost',
						size: 'icon',
						class: 'absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full',
						onclick: () => filterState.toggleTagSearch(),
						children: ($$anchor, $$slotProps) => {
							var fragment_14 = root_1();
							var node_17 = $.first_child(fragment_14);

							X(node_17, { class: 'h-4 w-4' });
							$.next(2);
							$.append($$anchor, fragment_14);
						},
						$$slots: { default: true }
					});

					$.reset(div_6);

					$.delegated('keydown', input_2, function (...$$args) {
						filterState.handleTagSearchKeyDown?.apply(this, $$args);
					});

					$.bind_value(input_2, () => filterState.tagSearchQuery, ($$value) => filterState.tagSearchQuery = $$value);
					$.transition(1, div_6, () => fly, () => ({ x: 10, duration: 200, easing: quintOut }));
					$.append($$anchor, div_6);
				};

				var alternate_2 = ($$anchor) => {
					var div_7 = root_10();
					var p_1 = $.child(div_7);
					var node_18 = $.sibling(p_1, 2);

					Button(node_18, {
						class: 'flex w-8 items-center justify-center rounded-full text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700',
						variant: 'ghost',
						size: 'icon',
						onclick: () => filterState.toggleTagSearch(),
						children: ($$anchor, $$slotProps) => {
							var fragment_15 = root_3();

							$.next(2);
							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});

					$.reset(div_7);
					$.transition(1, p_1, () => fade, () => ({ duration: 200, delay: 200 }));
					$.append($$anchor, div_7);
				};

				$.if(node_15, ($$render) => {
					if (filterState.showTagSearch) $$render(consequent_7); else $$render(alternate_2, -1);
				});
			}

			var div_8 = $.sibling(node_15, 2);
			var node_19 = $.child(div_8);

			{
				var consequent_9 = ($$anchor) => {
					const tagsToShow = $.derived(() => filterState.filteredTags.slice(0, 5));
					var fragment_16 = root_7();
					var node_20 = $.first_child(fragment_16);

					$.each(node_20, 17, () => $.get(tagsToShow), $.index, ($$anchor, tag) => {
						var div_9 = root_11();
						var node_21 = $.child(div_9);

						{
							let $0 = $.derived(() => `tag-${$.get(tag).slug || $.get(tag).name}`);
							let $1 = $.derived(() => filterState.selectedTags.find((t) => t.name === $.get(tag).name) ? true : false);

							Checkbox(node_21, {
								get id() {
									return $.get($0);
								},

								get checked() {
									return $.get($1);
								},

								onCheckedChange: (checked) => {
									filterState.handleTagChange({ tag: $.get(tag), checked });
								}
							});
						}

						var label = $.sibling(node_21, 2);
						var text_4 = $.only_child(label, true);

						$.reset(div_9);

						$.template_effect(() => {
							$.set_attribute(label, 'for', `tag-${$.get(tag).slug || $.get(tag).name}`);
							$.set_text(text_4, $.get(tag).name);
						});

						$.append($$anchor, div_9);
					});

					var node_22 = $.sibling(node_20, 2);

					{
						var consequent_8 = ($$anchor) => {
							Button($$anchor, {
								variant: 'link',
								size: 'sm',
								class: 'ed-df__more mt-1 h-auto justify-start p-0',
								get onclick() {
									return filterState.toggleShowMoreTags;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text();

									$.template_effect(() => $.set_text(text_5, `+ ${filterState.filteredTags.length - 5} more`));
									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_22, ($$render) => {
							if (filterState.filteredTags.length > 5) $$render(consequent_8);
						});
					}

					$.append($$anchor, fragment_16);
				};

				var alternate_3 = ($$anchor) => {
					var fragment_19 = root_7();
					var node_23 = $.first_child(fragment_19);

					$.each(node_23, 17, () => filterState.filteredTags, $.index, ($$anchor, tag) => {
						var div_10 = root_11();
						var node_24 = $.child(div_10);

						{
							let $0 = $.derived(() => `tag-${$.get(tag).slug || $.get(tag).name}`);
							let $1 = $.derived(() => filterState.selectedTags.find((t) => t.name === $.get(tag).name) ? true : false);

							Checkbox(node_24, {
								get id() {
									return $.get($0);
								},

								get checked() {
									return $.get($1);
								},

								onCheckedChange: (checked) => {
									filterState.handleTagChange({ tag: $.get(tag), checked });
								}
							});
						}

						var label_1 = $.sibling(node_24, 2);
						var text_6 = $.only_child(label_1, true);

						$.reset(div_10);

						$.template_effect(() => {
							$.set_attribute(label_1, 'for', `tag-${$.get(tag).slug || $.get(tag).name}`);
							$.set_text(text_6, $.get(tag).name);
						});

						$.append($$anchor, div_10);
					});

					var node_25 = $.sibling(node_23, 2);

					Button(node_25, {
						variant: 'link',
						size: 'sm',
						class: 'ed-df__more mt-1 h-auto justify-start p-0',
						get onclick() {
							return filterState.toggleShowMoreTags;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Show less');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_19);
				};

				$.if(node_19, ($$render) => {
					if (!filterState.showMoreTags) $$render(consequent_9); else $$render(alternate_3, -1);
				});
			}

			$.reset(div_8);
			$.next(2);
			$.append($$anchor, fragment_13);
		};

		$.if(node_14, ($$render) => {
			if (filterState.tags.length > 0) $$render(consequent_10);
		});
	}

	var div_11 = $.sibling(node_14, 4);
	var div_12 = $.child(div_11);
	var div_13 = $.only_child(div_12);
	var input_3 = $.sibling(div_12, 2);

	$.remove_input_defaults(input_3);

	var input_4 = $.sibling(input_3, 2);

	$.remove_input_defaults(input_4);
	$.reset(div_11);

	var div_14 = $.sibling(div_11, 2);
	var node_26 = $.child(div_14);

	{
		let $0 = $.derived(() => page.data?.store?.currency?.symbol);

		Textbox(node_26, {
			type: 'number',
			get label() {
				return `Min (${$.get($0) ?? ''})`;
			},

			get onchange() {
				return filterState.handleMinPriceChange;
			},

			get value() {
				return filterState.minPrice;
			},

			set value($$value) {
				filterState.minPrice = $$value;
			}
		});
	}

	var node_27 = $.sibling(node_26, 2);

	{
		let $0 = $.derived(() => page.data?.store?.currency?.symbol);

		Textbox(node_27, {
			type: 'number',
			get label() {
				return `Max (${$.get($0) ?? ''})`;
			},

			get onchange() {
				return filterState.handleMaxPriceChange;
			},

			get value() {
				return filterState.maxPrice;
			},

			set value($$value) {
				filterState.maxPrice = $$value;
			}
		});
	}

	$.reset(div_14);

	var node_28 = $.sibling(div_14, 2);

	{
		var consequent_15 = ($$anchor) => {
			var fragment_20 = $.comment();
			var node_29 = $.first_child(fragment_20);

			$.each(node_29, 17, () => Object.keys(filterState.processedFilters), $.index, ($$anchor, key, idx) => {
				var fragment_21 = root_15();
				var div_15 = $.sibling($.first_child(fragment_21), 2);
				var p_2 = $.child(div_15);
				var text_8 = $.only_child(p_2, true);
				var div_16 = $.sibling(p_2, 2);
				var node_30 = $.child(div_16);

				{
					var consequent_13 = ($$anchor) => {
						const valuesToShow = $.derived(() => filterState.processedFilters[$.get(key)].slice(0, 3));
						var fragment_22 = root_7();
						var node_31 = $.first_child(fragment_22);

						$.each(node_31, 17, () => $.get(valuesToShow), $.index, ($$anchor, value) => {
							var div_17 = root_14();
							var node_32 = $.child(div_17);

							{
								let $0 = $.derived(() => `gen-${$.get(value)}`);
								let $1 = $.derived(() => filterState.selectedGeneralFilters[$.get(key)]?.includes($.get(value)));

								Checkbox(node_32, {
									get id() {
										return $.get($0);
									},

									get checked() {
										return $.get($1);
									},

									onCheckedChange: (checked) => {
										filterState.handleGeneralFiltersChange({ key: $.get(key), value: $.get(value), checked });
									}
								});
							}

							var label_2 = $.sibling(node_32, 2);
							var node_33 = $.child(label_2);

							{
								var consequent_11 = ($$anchor) => {
									var div_18 = root_13();
									var div_19 = $.child(div_18);
									var text_9 = $.sibling(div_19);

									$.reset(div_18);

									$.template_effect(
										($0) => {
											$.set_style(div_19, `background-color: ${$.get(value) ?? ''};`);
											$.set_text(text_9, ` ${$0 ?? ''}`);
										},
										[() => GetColorName($.get(value))]
									);

									$.append($$anchor, div_18);
								};

								var d = $.derived(() => $.get(value)?.startsWith?.('#'));

								var alternate_4 = ($$anchor) => {
									var text_10 = $.text();

									$.template_effect(() => $.set_text(text_10, $.get(value)));
									$.append($$anchor, text_10);
								};

								$.if(node_33, ($$render) => {
									if ($.get(d)) $$render(consequent_11); else $$render(alternate_4, -1);
								});
							}

							$.reset(label_2);
							$.reset(div_17);
							$.template_effect(() => $.set_attribute(label_2, 'for', `gen-${$.get(value)}`));
							$.append($$anchor, div_17);
						});

						var node_34 = $.sibling(node_31, 2);

						{
							var consequent_12 = ($$anchor) => {
								Button($$anchor, {
									variant: 'link',
									size: 'sm',
									class: 'ed-df__more mt-1 h-auto justify-start p-0',
									onclick: () => {
										filterState.showMoreGeneralFilters[idx] = true;
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_11 = $.text();

										$.template_effect(() => $.set_text(text_11, `+ ${filterState.processedFilters[$.get(key)].length - 3} more`));
										$.append($$anchor, text_11);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_34, ($$render) => {
								if (filterState.processedFilters[$.get(key)].length > 3) $$render(consequent_12);
							});
						}

						$.append($$anchor, fragment_22);
					};

					var alternate_6 = ($$anchor) => {
						var fragment_26 = root_7();
						var node_35 = $.first_child(fragment_26);

						$.each(node_35, 17, () => filterState.processedFilters[$.get(key)], $.index, ($$anchor, value) => {
							var div_20 = root_14();
							var node_36 = $.child(div_20);

							{
								let $0 = $.derived(() => `gen-${$.get(value)}`);
								let $1 = $.derived(() => filterState.selectedGeneralFilters[$.get(key)]?.includes($.get(value)));

								Checkbox(node_36, {
									get id() {
										return $.get($0);
									},

									get checked() {
										return $.get($1);
									},

									onCheckedChange: (checked) => {
										filterState.handleGeneralFiltersChange({ key: $.get(key), value: $.get(value), checked });
									}
								});
							}

							var label_3 = $.sibling(node_36, 2);
							var node_37 = $.child(label_3);

							{
								var consequent_14 = ($$anchor) => {
									var div_21 = root_13();
									var div_22 = $.child(div_21);
									var text_12 = $.sibling(div_22);

									$.reset(div_21);

									$.template_effect(
										($0) => {
											$.set_style(div_22, `background-color: ${$.get(value) ?? ''};`);
											$.set_text(text_12, ` ${$0 ?? ''}`);
										},
										[() => GetColorName($.get(value))]
									);

									$.append($$anchor, div_21);
								};

								var d_1 = $.derived(() => $.get(value)?.startsWith?.('#'));

								var alternate_5 = ($$anchor) => {
									var text_13 = $.text();

									$.template_effect(() => $.set_text(text_13, $.get(value)));
									$.append($$anchor, text_13);
								};

								$.if(node_37, ($$render) => {
									if ($.get(d_1)) $$render(consequent_14); else $$render(alternate_5, -1);
								});
							}

							$.reset(label_3);
							$.reset(div_20);
							$.template_effect(() => $.set_attribute(label_3, 'for', `gen-${$.get(value)}`));
							$.append($$anchor, div_20);
						});

						var node_38 = $.sibling(node_35, 2);

						Button(node_38, {
							variant: 'link',
							size: 'sm',
							class: 'ed-df__more mt-1 h-auto justify-start p-0',
							onclick: () => {
								filterState.showMoreGeneralFilters[idx] = false;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_14 = $.text('Show less');

								$.append($$anchor, text_14);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_26);
					};

					$.if(node_30, ($$render) => {
						if (!filterState.showMoreGeneralFilters[idx]) $$render(consequent_13); else $$render(alternate_6, -1);
					});
				}

				$.reset(div_16);
				$.reset(div_15);
				$.template_effect(($0) => $.set_text(text_8, $0), [() => filterState.formatFilterName($.get(key))]);
				$.append($$anchor, fragment_21);
			});

			$.append($$anchor, fragment_20);
		};

		$.if(node_28, ($$render) => {
			if (filterState.processedFilters) $$render(consequent_15);
		});
	}

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => filterState.container = $$value, () => filterState?.container);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_style(div, `top: ${filterState.containerTop}px;`);
			$.set_class(div_1, 1, $0, 'svelte-1xbwik7');

			$.set_style(div_1, `height: ${browser
				? window?.innerHeight - (filterState.containerTop || 0)
				: 'auto'}px`);

			$.set_style(div_13, `left: ${filterState.priceSliderLeftPercentage ?? ''}%; right: ${filterState.priceSliderRightPercentage ?? ''}%`);
			$.set_attribute(input_3, 'min', filterState.minPossiblePrice);
			$.set_attribute(input_3, 'max', filterState.maxPossiblePrice);
			$.set_attribute(input_4, 'min', filterState.minPossiblePrice);
			$.set_attribute(input_4, 'max', filterState.maxPossiblePrice);
		},
		[
			() => $.clsx(cn('ed-df__panel intra-gap flex min-w-56 flex-col overflow-y-auto !pb-20 scrollbar-none scrollbar-track-transparent scrollbar-thumb-transparent  group-hover:scrollbar-track-inherit group-hover:scrollbar-thumb-inherit', className()))
		]
	);

	$.delegated('change', input_3, function (...$$args) {
		filterState.handleMinPriceChange?.apply(this, $$args);
	});

	$.bind_value(input_3, () => filterState.minPrice, ($$value) => filterState.minPrice = $$value);

	$.delegated('change', input_4, function (...$$args) {
		filterState.handleMaxPriceChange?.apply(this, $$args);
	});

	$.bind_value(input_4, () => filterState.maxPrice, ($$value) => filterState.maxPrice = $$value);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown', 'change']);