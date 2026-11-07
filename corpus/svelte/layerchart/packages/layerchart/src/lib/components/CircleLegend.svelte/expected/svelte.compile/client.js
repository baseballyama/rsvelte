import 'svelte/internal/disclose-version';
import { asAny } from '$lib/utils/types.js';
import * as $ from 'svelte/internal/client';
import { format } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import { getChartContext } from '$lib/contexts/chart.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'scale',
	'title',
	'ticks',
	'tickValues',
	'tickFormat',
	'tickFontSize',
	'titleFontSize',
	'labelWidth',
	'labelGap',
	'labelPlacement',
	'placement',
	'fill',
	'stroke',
	'strokeWidth',
	'value',
	'classes',
	'ref',
	'class'
]);

var root = $.from_svg(`<text text-anchor="middle"> </text>`);
var root_1 = $.from_svg(`<circle fill-opacity="0.5"></circle>`);
var root_2 = $.from_svg(`<line stroke-dasharray="2,2"></line>`);
var root_3 = $.from_svg(`<circle></circle><!><text> </text>`, 1);
var root_4 = $.from_svg(`<svg class="lc-circle-legend-svg svelte-1hlnf2p"><!><g class="lc-circle-legend-g"><!><!></g></svg>`);
var root_5 = $.from_html(`<div><!></div>`);

export default function CircleLegend($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 3, ''),
		ticks = $.prop($$props, 'ticks', 3, 4),
		tickFontSize = $.prop($$props, 'tickFontSize', 3, 10),
		titleFontSize = $.prop($$props, 'titleFontSize', 3, 10),
		labelWidth = $.prop($$props, 'labelWidth', 3, 40),
		labelGap = $.prop($$props, 'labelGap', 3, 4),
		labelPlacement = $.prop($$props, 'labelPlacement', 3, 'right'),
		fill = $.prop($$props, 'fill', 3, 'none'),
		stroke = $.prop($$props, 'stroke', 3, 'currentColor'),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 1),
		classes = $.prop($$props, 'classes', 19, () => ({})),
		refProp = $.prop($$props, 'ref', 15),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	const ctx = getChartContext();
	const scale = $.derived(() => $$props.scale ?? ctx.rScale);

	const tickValues = $.derived(() => {
		if ($$props.tickValues) return $$props.tickValues;
		if (!$.get(scale)) return [];

		// Prefer scale.ticks (continuous scales) and pick the largest `ticks` positive values
		if (typeof $.get(scale).ticks === 'function') {
			const all = $.get(scale).ticks(ticks()).filter((v) => Number($.get(scale)(v)) > 0);

			if (all.length >= 2) {
				return all.slice(-ticks());
			}
		}

		// Fallback: derive evenly spaced values from the domain extent
		const domain = $.get(scale).domain();

		const min = Number(domain[0]);
		const max = Number(domain[domain.length - 1]);
		const n = Math.max(2, ticks());

		return Array.from({ length: n }, (_, i) => min + (max - min) * (i + 1) / n);
	});

	const items = $.derived(() => {
		if (!$.get(scale)) return [];

		return $.get(tickValues).map((value) => ({ value, radius: Number($.get(scale)(value)) })).filter((d) => Number.isFinite(d.radius) && d.radius > 0).sort((a, b) => b.radius - a.radius);
	});

	const maxRadius = $.derived(() => $.get(items)[0]?.radius ?? 0);

	// Indicator for the currently hovered value. If `value` is explicitly
	// provided, use it; otherwise fall back to `ctx.tooltip.data` piped through
	// the chart's radius accessor (`ctx.r`).
	const indicatorRadius = $.derived(() => {
		if (!$.get(scale)) return null;

		let value = $$props.value;

		if (value == null) {
			const data = ctx.tooltip?.data;

			if (data == null) return null;

			value = ctx.r?.(data);
		}

		if (value == null) return null;

		const r = Number($.get(scale)(value));

		if (!Number.isFinite(r) || r <= 0) return null;

		return r;
	});

	const padding = $.derived(() => Math.ceil(strokeWidth() / 2));
	const titleHeight = $.derived(() => title() ? titleFontSize() + 6 : 0);

	const width = $.derived(() => labelPlacement() === 'inline'
		? $.get(maxRadius) * 2 + $.get(padding) * 2
		: $.get(maxRadius) * 2 + $.get(padding) * 2 + labelGap() + labelWidth());

	const svgHeight = $.derived(() => $.get(maxRadius) * 2 + $.get(padding) * 2 + $.get(titleHeight));

	const cx = $.derived(() => labelPlacement() === 'left'
		? labelWidth() + labelGap() + $.get(maxRadius) + $.get(padding)
		: $.get(maxRadius) + $.get(padding));

	const baseY = $.derived(() => $.get(maxRadius) * 2 + $.get(padding) + $.get(titleHeight));

	// Leader line / label x positions (only used for left/right placement)
	const labelLineX = $.derived(() => labelPlacement() === 'left'
		? $.get(cx) - $.get(maxRadius) - labelGap()
		: $.get(cx) + $.get(maxRadius) + labelGap());

	const labelTextX = $.derived(() => labelPlacement() === 'inline'
		? $.get(cx)
		: labelPlacement() === 'left' ? $.get(labelLineX) - 2 : $.get(labelLineX) + 2);

	const labelTextAnchor = $.derived(() => labelPlacement() === 'inline'
		? 'middle'
		: labelPlacement() === 'left' ? 'end' : 'start');

	var div = root_5();

	$.attribute_effect(
		div,
		($0) => ({ ...restProps, 'data-placement': $$props.placement, class: $0 }),
		[
			() => cls('lc-circle-legend-container', $$props.class, classes().root)
		],
		void 0,
		void 0,
		'svelte-1hlnf2p'
	);

	var node = $.child(div);

	{
		var consequent_3 = ($$anchor) => {
			var svg = root_4();
			var node_1 = $.child(svg);

			{
				var consequent = ($$anchor) => {
					var text = root();
					let styles;
					var text_1 = $.only_child(text, true);

					$.template_effect(
						($0) => {
							$.set_attribute(text, 'x', $.get(cx));
							$.set_attribute(text, 'y', titleFontSize());
							$.set_class(text, 0, $0, 'svelte-1hlnf2p');
							styles = $.set_style(text, '', styles, { 'font-size': titleFontSize() });
							$.set_text(text_1, title());
						},
						[() => $.clsx(cls('lc-circle-legend-title', classes().title))]
					);

					$.append($$anchor, text);
				};

				$.if(node_1, ($$render) => {
					if (title()) $$render(consequent);
				});
			}

			var g = $.sibling(node_1);
			var node_2 = $.child(g);

			{
				var consequent_1 = ($$anchor) => {
					var circle = root_1();

					$.template_effect(
						($0) => {
							$.set_attribute(circle, 'cx', $.get(cx));
							$.set_attribute(circle, 'cy', $.get(baseY) - $.get(indicatorRadius));
							$.set_attribute(circle, 'r', $.get(indicatorRadius));
							$.set_attribute(circle, 'fill', stroke());
							$.set_class(circle, 0, $0, 'svelte-1hlnf2p');
						},
						[() => $.clsx(cls('lc-circle-legend-indicator'))]
					);

					$.append($$anchor, circle);
				};

				$.if(node_2, ($$render) => {
					if ($.get(indicatorRadius) != null) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2);

			$.each(node_3, 17, () => $.get(items), (item) => item.value, ($$anchor, item) => {
				var fragment = root_3();
				var circle_1 = $.first_child(fragment);
				var node_4 = $.sibling(circle_1);

				{
					var consequent_2 = ($$anchor) => {
						var line = root_2();

						$.template_effect(
							($0) => {
								$.set_attribute(line, 'x1', $.get(cx));
								$.set_attribute(line, 'y1', $.get(baseY) - $.get(item).radius * 2);
								$.set_attribute(line, 'x2', $.get(labelLineX));
								$.set_attribute(line, 'y2', $.get(baseY) - $.get(item).radius * 2);
								$.set_attribute(line, 'stroke', stroke());
								$.set_class(line, 0, $0, 'svelte-1hlnf2p');
							},
							[() => $.clsx(cls('lc-circle-legend-tick', classes().tick))]
						);

						$.append($$anchor, line);
					};

					$.if(node_4, ($$render) => {
						if (labelPlacement() !== 'inline') $$render(consequent_2);
					});
				}

				var text_2 = $.sibling(node_4);
				let styles_1;
				var text_3 = $.only_child(text_2, true);

				$.template_effect(
					($0, $1, $2) => {
						$.set_attribute(circle_1, 'cx', $.get(cx));
						$.set_attribute(circle_1, 'cy', $.get(baseY) - $.get(item).radius);
						$.set_attribute(circle_1, 'r', $.get(item).radius);
						$.set_attribute(circle_1, 'fill', fill());
						$.set_attribute(circle_1, 'stroke', stroke());
						$.set_attribute(circle_1, 'stroke-width', strokeWidth());
						$.set_class(circle_1, 0, $0, 'svelte-1hlnf2p');
						$.set_attribute(text_2, 'x', $.get(labelTextX));

						$.set_attribute(text_2, 'y', labelPlacement() === 'inline'
							? $.get(baseY) - $.get(item).radius * 2 + tickFontSize()
							: $.get(baseY) - $.get(item).radius * 2);

						$.set_attribute(text_2, 'text-anchor', $.get(labelTextAnchor));
						$.set_attribute(text_2, 'dominant-baseline', labelPlacement() === 'inline' ? 'auto' : 'middle');
						$.set_class(text_2, 0, $1, 'svelte-1hlnf2p');
						styles_1 = $.set_style(text_2, '', styles_1, { 'font-size': tickFontSize() });
						$.set_text(text_3, $2);
					},
					[
						() => $.clsx(cls('lc-circle-legend-circle', classes().circle)),
						() => $.clsx(cls('lc-circle-legend-label', classes().label)),
						() => $$props.tickFormat
							? format($.get(item).value, asAny($$props.tickFormat))
							: $.get(item).value
					]
				);

				$.append($$anchor, fragment);
			});

			$.reset(g);
			$.reset(svg);

			$.template_effect(() => {
				$.set_attribute(svg, 'width', $.get(width));
				$.set_attribute(svg, 'height', $.get(svgHeight));
				$.set_attribute(svg, 'viewBox', `0 0 ${$.get(width) ?? ''} ${$.get(svgHeight) ?? ''}`);
			});

			$.append($$anchor, svg);
		};

		$.if(node, ($$render) => {
			if ($.get(items).length) $$render(consequent_3);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));
	$.append($$anchor, div);
	$.pop();
}