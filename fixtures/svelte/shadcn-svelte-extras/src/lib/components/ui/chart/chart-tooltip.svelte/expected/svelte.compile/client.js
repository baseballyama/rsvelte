import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { getPayloadConfigFromPayload, useChart } from './chart-utils.js';
import { getChartContext, Tooltip as TooltipPrimitive } from 'layerchart';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'hideLabel',
	'indicator',
	'hideIndicator',
	'labelKey',
	'label',
	'labelFormatter',
	'labelClassName',
	'formatter',
	'nameKey',
	'color'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<span class="text-foreground font-mono font-medium tabular-nums"> </span>`);
var root_3 = $.from_html(`<!> <div><div class="grid gap-1.5"><!> <span class="text-muted-foreground"> </span></div> <!></div>`, 1);
var root_4 = $.from_html(`<div><!> <div class="grid gap-1.5"></div></div>`);

export default function Chart_tooltip($$anchor, $$props) {
	$.push($$props, true);

	const // eslint-disable-next-line @typescript-eslint/no-explicit-any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// Filter to series with defined values (important for item-based charts like Pie/Arc
	// where only the hovered item has a value)
	// Get the x-axis label value from the raw tooltip data (e.g. a Date or month string)
	TooltipLabel = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent_1 = ($$anchor) => {
				var div = root();
				var node_1 = $.child(div);

				{
					var consequent = ($$anchor) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.snippet(node_2, () => $.get(formattedLabel));
						$.append($$anchor, fragment_1);
					};

					var alternate = ($$anchor) => {
						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(formattedLabel)));
						$.append($$anchor, text);
					};

					$.if(node_1, ($$render) => {
						if (typeof $.get(formattedLabel) === 'function') $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(div);
				$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn('font-medium', $$props.labelClassName))]);
				$.append($$anchor, div);
			};

			$.if(node, ($$render) => {
				if ($.get(formattedLabel)) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment);
	};

	function defaultFormatter(value, _payload) {
		return `${value}`;
	}

	let ref = $.prop($$props, 'ref', 15, null),
		hideLabel = $.prop($$props, 'hideLabel', 3, false),
		indicator = $.prop($$props, 'indicator', 3, 'dot'),
		hideIndicator = $.prop($$props, 'hideIndicator', 3, false),
		labelFormatter = $.prop($$props, 'labelFormatter', 3, defaultFormatter),
		restProps = $.rest_props($$props, rest_excludes);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const chart = useChart();

	const chartCtx = getChartContext();

	// Filter to series with defined values (important for item-based charts like Pie/Arc
	// where only the hovered item has a value)
	const visibleSeries = $.derived(() => chartCtx.tooltip.series.filter((s) => s.value !== undefined));

	const formattedLabel = $.derived(() => {
		if (hideLabel() || !$.get(visibleSeries)?.length) return null;

		const [item] = $.get(visibleSeries);
		const tooltipData = chartCtx.tooltip.data;

		// Get the x-axis label value from the raw tooltip data (e.g. a Date or month string)
		const dataLabel = tooltipData != null ? chartCtx.x(tooltipData) : undefined;

		const key = $$props.labelKey ?? item?.label ?? item?.key ?? 'value';
		const itemConfig = getPayloadConfigFromPayload(chart.config, item, key, tooltipData);
		let value;

		if (!$$props.labelKey && typeof $$props.label === 'string') {
			value = chart.config[$$props.label]?.label ?? $$props.label;
		} else if ($$props.labelKey) {
			value = itemConfig?.label ?? dataLabel;
		} else {
			value = dataLabel;
		}

		if (value === undefined) return null;
		if (!labelFormatter()) return value;

		return labelFormatter()(value, $.get(visibleSeries));
	});

	const nestLabel = $.derived(() => $.get(visibleSeries).length === 1 && indicator() !== 'dot');
	var fragment_3 = $.comment();
	var node_3 = $.first_child(fragment_3);

	$.component(node_3, () => TooltipPrimitive.Root, ($$anchor, TooltipPrimitive_Root) => {
		TooltipPrimitive_Root($$anchor, {
			variant: 'none',
			children: ($$anchor, $$slotProps) => {
				var div_1 = root_4();

				$.attribute_effect(div_1, ($0) => ({ class: $0, ...restProps }), [
					() => cn('border-border/50 bg-background grid min-w-[9rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl', $$props.class)
				]);

				var node_4 = $.child(div_1);

				{
					var consequent_2 = ($$anchor) => {
						TooltipLabel($$anchor);
					};

					$.if(node_4, ($$render) => {
						if (!$.get(nestLabel)) $$render(consequent_2);
					});
				}

				var div_2 = $.sibling(node_4, 2);

				$.each(div_2, 23, () => $.get(visibleSeries), (item, i) => item.key + i, ($$anchor, item, i) => {
					const key = $.derived(() => `${$$props.nameKey || $.get(item).key || $.get(item).label || 'value'}`);
					const itemConfig = $.derived(() => getPayloadConfigFromPayload(chart.config, $.get(item), $.get(key), chartCtx.tooltip.data));
					const indicatorColor = $.derived(() => $$props.color || $.get(item).config?.color || $.get(item).color);
					var div_3 = root();
					var node_5 = $.child(div_3);

					{
						var consequent_3 = ($$anchor) => {
							var fragment_5 = $.comment();
							var node_6 = $.first_child(fragment_5);

							$.snippet(node_6, () => $$props.formatter, () => ({
								value: $.get(item).value,
								name: $.get(item).label,
								item: $.get(item),
								index: $.get(i),
								payload: $.get(visibleSeries)
							}));

							$.append($$anchor, fragment_5);
						};

						var alternate_1 = ($$anchor) => {
							var fragment_6 = root_3();
							var node_7 = $.first_child(fragment_6);

							{
								var consequent_4 = ($$anchor) => {
									var fragment_7 = $.comment();
									var node_8 = $.first_child(fragment_7);

									$.component(node_8, () => $.get(itemConfig).icon, ($$anchor, itemConfig_icon) => {
										itemConfig_icon($$anchor, {});
									});

									$.append($$anchor, fragment_7);
								};

								var consequent_5 = ($$anchor) => {
									var div_4 = root_1();

									$.template_effect(
										($0) => {
											$.set_style(div_4, `--color-bg: ${$.get(indicatorColor) ?? ''}; --color-border: ${$.get(indicatorColor) ?? ''};`);
											$.set_class(div_4, 1, $0);
										},
										[
											() => $.clsx(cn('shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)', {
												'size-2.5': indicator() === 'dot',
												'h-full w-1': indicator() === 'line',
												'w-0 border-[1.5px] border-dashed bg-transparent': indicator() === 'dashed',
												'my-0.5': $.get(nestLabel) && indicator() === 'dashed'
											}))
										]
									);

									$.append($$anchor, div_4);
								};

								$.if(node_7, ($$render) => {
									if ($.get(itemConfig)?.icon) $$render(consequent_4); else if (!hideIndicator()) $$render(consequent_5, 1);
								});
							}

							var div_5 = $.sibling(node_7, 2);
							var div_6 = $.child(div_5);
							var node_9 = $.child(div_6);

							{
								var consequent_6 = ($$anchor) => {
									TooltipLabel($$anchor);
								};

								$.if(node_9, ($$render) => {
									if ($.get(nestLabel)) $$render(consequent_6);
								});
							}

							var span = $.sibling(node_9, 2);
							var text_1 = $.only_child(span, true);

							$.reset(div_6);

							var node_10 = $.sibling(div_6, 2);

							{
								var consequent_7 = ($$anchor) => {
									var span_1 = root_2();
									var text_2 = $.only_child(span_1, true);

									$.template_effect(($0) => $.set_text(text_2, $0), [() => $.get(item).value.toLocaleString()]);
									$.append($$anchor, span_1);
								};

								$.if(node_10, ($$render) => {
									if ($.get(item).value !== undefined) $$render(consequent_7);
								});
							}

							$.reset(div_5);

							$.template_effect(
								($0) => {
									$.set_class(div_5, 1, $0);
									$.set_text(text_1, $.get(itemConfig)?.label || $.get(item).label);
								},
								[
									() => $.clsx(cn('flex flex-1 shrink-0 justify-between leading-none', $.get(nestLabel) ? 'items-end' : 'items-center'))
								]
							);

							$.append($$anchor, fragment_6);
						};

						$.if(node_5, ($$render) => {
							if ($$props.formatter && $.get(item).value !== undefined && $.get(item).label) $$render(consequent_3); else $$render(alternate_1, -1);
						});
					}

					$.reset(div_3);

					$.template_effect(($0) => $.set_class(div_3, 1, $0), [
						() => $.clsx(cn('[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5', indicator() === 'dot' && 'items-center'))
					]);

					$.append($$anchor, div_3);
				});

				$.reset(div_2);
				$.reset(div_1);
				$.bind_this(div_1, ($$value) => ref($$value), () => ref());
				$.append($$anchor, div_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_3);
	$.pop();
}