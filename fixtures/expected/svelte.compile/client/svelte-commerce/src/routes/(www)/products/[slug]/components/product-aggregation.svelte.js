import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { useProductState } from '$lib/core/composables/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { sortByNumericValue } from '$lib/core/utils/index.js';

var root = $.from_html(`<div class="flex flex-col gap-3"><div class="flex items-center gap-2"><span class="text-sm font-semibold text-gray-900 dark:text-gray-100 edp-opt-label"> <!></span> <span class="font-semibold edp-opt-value"> </span></div> <div class="flex flex-wrap items-center gap-3"></div></div>`);
var root_1 = $.from_html(`<div class="intra-gap flex flex-col edp-aggregation"></div>`);

export default function Product_aggregation($$anchor, $$props) {
	$.push($$props, true);

	const productState = useProductState();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_1();

			$.each(div, 21, () => Object.entries(page.data?.product?.ag || {}), $.index, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let optionName = () => $.get($$array)[0];
				let values = () => $.get($$array)[1];
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent_1 = ($$anchor) => {
						var div_1 = root();
						var div_2 = $.child(div_1);
						var span = $.child(div_2);
						var text = $.child(span);
						var node_2 = $.sibling(text);

						{
							var consequent = ($$anchor) => {
								var text_1 = $.text(':');

								$.append($$anchor, text_1);
							};

							$.if(node_2, ($$render) => {
								if (productState.selectedAggregations?.[optionName()]) $$render(consequent);
							});
						}

						$.reset(span);

						var span_1 = $.sibling(span, 2);
						var text_2 = $.only_child(span_1, true);

						$.reset(div_2);

						var div_3 = $.sibling(div_2, 2);

						$.each(div_3, 21, () => sortByNumericValue(values()), $.index, ($$anchor, value) => {
							{
								let $0 = $.derived(() => productState.selectedAggregations?.[optionName()] === $.get(value) ? 'default' : 'plain');
								let $1 = $.derived(() => !productState.isAggregationAvaliable(optionName(), $.get(value)));

								let $2 = $.derived(() => productState.selectedAggregations?.[optionName()] === $.get(value)
									? 'edp-on border !border-accent !bg-transparent'
									: '!bg-accent text-accent-foreground');

								Button($$anchor, {
									get variant() {
										return $.get($0);
									},

									get disabled() {
										return $.get($1);
									},

									get class() {
										return `edp-pill min-w-[3.5rem] !bg-primary px-4 py-2 ${$.get($2) ?? ''}`;
									},
									onclick: () => productState.toggleAggregation(optionName(), $.get(value), true),
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text();

										$.template_effect(() => $.set_text(text_3, $.get(value)));
										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							}
						});

						$.reset(div_3);
						$.reset(div_1);

						$.template_effect(() => {
							$.set_text(text, `${optionName() ?? ''} `);
							$.set_text(text_2, productState.selectedAggregations?.[optionName()] || '');
						});

						$.append($$anchor, div_1);
					};

					var d = $.derived(() => Array.isArray(values()));

					$.if(node_1, ($$render) => {
						if ($.get(d)) $$render(consequent_1);
					});
				}

				$.append($$anchor, fragment_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		var d_1 = $.derived(() => page.data?.product?.ag && Object.keys(page.data?.product?.ag).length);

		$.if(node, ($$render) => {
			if ($.get(d_1)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}