import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useProductState } from '$lib/core/composables/index.js';
import { ChartNoAxesGanttIcon } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button';
import SizeGuideDrawer from './size-guide-drawer.svelte';

var root = $.from_html(`<div class="h-full w-full rounded-full"></div> <span class="sr-only"> </span>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-3"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="text-sm font-semibold  text-gray-900 dark:text-gray-100 edp-opt-label"> <!></span> <span class="font-semibold edp-opt-value"> </span></div> <!></div> <div class="flex flex-wrap items-center gap-3" role="group"></div></div>`);
var root_2 = $.from_html(`<div class="intra-gap flex flex-col edp-variation"><!></div>`);

export default function Product_variation($$anchor, $$props) {
	$.push($$props, true);

	const productState = useProductState();
	var div = root_2();
	var node = $.child(div);

	$.key(node, () => productState.productOptions, ($$anchor) => {
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		$.each(node_1, 17, () => productState.productOptions || [], $.index, ($$anchor, option) => {
			var div_1 = root_1();
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var span = $.child(div_3);
			var text = $.child(span);
			var node_2 = $.sibling(text);

			{
				var consequent = ($$anchor) => {
					var text_1 = $.text(':');

					$.append($$anchor, text_1);
				};

				var d = $.derived(() => productState.selectedVariant?.options?.find((opt) => $.get(option).id === opt.optionId)?.value);

				$.if(node_2, ($$render) => {
					if ($.get(d)) $$render(consequent);
				});
			}

			$.reset(span);

			var span_1 = $.sibling(span, 2);
			var text_2 = $.only_child(span_1, true);

			$.reset(div_3);

			var node_3 = $.sibling(div_3, 2);

			{
				var consequent_1 = ($$anchor) => {
					SizeGuideDrawer($$anchor, {});
				};

				$.if(node_3, ($$render) => {
					if ($.get(option).type === 'Size') $$render(consequent_1);
				});
			}

			$.reset(div_2);

			var div_4 = $.sibling(div_2, 2);

			$.each(div_4, 21, () => $.get(option).values || [], $.index, ($$anchor, v) => {
				var fragment_2 = $.comment();
				var node_4 = $.first_child(fragment_2);

				{
					var consequent_2 = ($$anchor) => {
						{
							let $0 = $.derived(() => productState.isVariantOptionSelected($.get(option).id, $.get(v).value));
							let $1 = $.derived(() => productState.isVariantOptionSelected($.get(option).id, $.get(v).value) ? 'edp-on ring-2 ring-primary ring-offset-2' : '');
							let $2 = $.derived(() => !$.get(v)?.selectable ? 'opacity-40' : '');

							Button($$anchor, {
								variant: 'outline',
								size: 'icon',
								get 'aria-pressed'() {
									return $.get($0);
								},

								get class() {
									return `edp-swatch group relative h-10 w-10 rounded-full p-0.5 ${$.get($1) ?? ''} ${$.get($2) ?? ''}`;
								},
								onclick: () => productState.selectVariant({ option: $.get(option), value: $.get(v) }),
								get title() {
									return $.get(v).value;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var div_5 = $.first_child(fragment_4);
									var span_2 = $.sibling(div_5, 2);
									var text_3 = $.only_child(span_2, true);

									$.template_effect(() => {
										$.set_style(div_5, `background-color: ${$.get(v).value ?? ''}`);
										$.set_text(text_3, $.get(v).value);
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						}
					};

					var alternate = ($$anchor) => {
						{
							let $0 = $.derived(() => productState.isVariantOptionSelected($.get(option).id, $.get(v).value) ? 'default' : 'plain');
							let $1 = $.derived(() => productState.isVariantOptionSelected($.get(option).id, $.get(v).value));
							let $2 = $.derived(() => !$.get(v)?.selectable);

							let $3 = $.derived(() => productState.isVariantOptionSelected($.get(option).id, $.get(v).value)
								? 'edp-on border !border-accent !bg-transparent'
								: '!bg-accent text-accent-foreground');

							Button($$anchor, {
								get variant() {
									return $.get($0);
								},

								get 'aria-pressed'() {
									return $.get($1);
								},

								get disabled() {
									return $.get($2);
								},

								get class() {
									return `edp-pill min-w-[3.5rem] !bg-primary px-4 py-2 ${$.get($3) ?? ''}`;
								},
								onclick: () => productState.selectVariant({ option: $.get(option), value: $.get(v) }),
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text();

									$.template_effect(() => $.set_text(text_4, $.get(v).value));
									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						}
					};

					$.if(node_4, ($$render) => {
						if ($.get(option).type === 'Color') $$render(consequent_2); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.reset(div_4);
			$.reset(div_1);

			$.template_effect(
				($0) => {
					$.set_text(text, `${$.get(option).title ?? ''} `);
					$.set_text(text_2, $0);
					$.set_attribute(div_4, 'aria-label', $.get(option).title);
				},
				[
					() => productState.selectedVariant?.options?.find((opt) => $.get(option).id === opt.optionId)?.value
				]
			);

			$.append($$anchor, div_1);
		});

		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}