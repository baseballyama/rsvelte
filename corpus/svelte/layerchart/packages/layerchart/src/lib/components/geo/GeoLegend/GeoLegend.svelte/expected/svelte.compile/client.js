import 'svelte/internal/disclose-version';
import { asAny } from '$lib/utils/types.js';
import * as $ from 'svelte/internal/client';
import { geoDistance } from 'd3-geo';
import { format } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import { getChartContext } from '$lib/contexts/chart.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'units',
	'variant',
	'distance',
	'ticks',
	'labelPlacement',
	'tickFormat',
	'tickFontSize',
	'titleFontSize',
	'height',
	'title',
	'referencePoint',
	'referenceScale',
	'placement',
	'color',
	'classes',
	'ref',
	'class'
]);

var root = $.from_svg(`<text> </text>`);
var root_1 = $.from_svg(`<path stroke-linecap="round" stroke-linejoin="round"></path>`);
var root_2 = $.from_svg(`<rect></rect>`);
var root_3 = $.from_svg(`<!><rect></rect>`, 1);
var root_4 = $.from_svg(`<text text-anchor="middle"> </text>`);
var root_5 = $.from_svg(`<svg class="lc-geo-legend-svg svelte-fxbnq7"><!><!><g class="lc-geo-legend-ticks"></g></svg>`);
var root_6 = $.from_html(`<div><!></div>`);

export default function GeoLegend($$anchor, $$props) {
	$.push($$props, true);

	let units = $.prop($$props, 'units', 3, 'mi'),
		variant = $.prop($$props, 'variant', 3, 'bracket'),
		ticks = $.prop($$props, 'ticks', 3, 4),
		labelPlacement = $.prop($$props, 'labelPlacement', 3, 'bottom'),
		tickFontSize = $.prop($$props, 'tickFontSize', 3, 10),
		titleFontSize = $.prop($$props, 'titleFontSize', 3, 10),
		height = $.prop($$props, 'height', 3, 4),
		title = $.prop($$props, 'title', 3, ''),
		color = $.prop($$props, 'color', 3, 'currentColor'),
		classes = $.prop($$props, 'classes', 19, () => ({})),
		refProp = $.prop($$props, 'ref', 15),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	const ctx = getChartContext();

	// Earth radius in the selected units
	const earthRadius = $.derived(() => units() === 'mi' ? 3958.8 : 6371);

	// Pixels per unit at the reference point on the current projection.
	// `null` if no projection or invert is unavailable (or numerically degenerate).
	const pixelsPerUnit = $.derived(() => {
		const projection = ctx.geo?.projection;

		if (!projection) return null;

		let pxPerUnit;

		if ($$props.referenceScale != null) {
			// Pre-projected data path (e.g. `geoIdentity` + us-atlas
			// `counties-albers-10m`): `projection.invert` returns topology pixel
			// coordinates, not lon/lat, so `geoDistance` can't be used. Instead,
			// combine the chart's fit scale with the known base projection scale:
			//   topology units per chart px = 1 / fitScale
			//   radians per topology unit   = 1 / referenceScale
			//   units (mi/km) per radian    = earthRadius
			// => px per unit = (fitScale * referenceScale) / earthRadius
			const fitScale = typeof projection.scale === 'function' ? projection.scale() : null;

			if (fitScale == null || !Number.isFinite(fitScale) || fitScale === 0) return null;

			pxPerUnit = fitScale * $$props.referenceScale / $.get(earthRadius);
		} else {
			if (typeof projection.invert !== 'function') return null;

			const refPx = $$props.referencePoint ?? [ctx.width / 2, ctx.height / 2];
			const a = projection.invert(refPx);
			const b = projection.invert([refPx[0] + 1, refPx[1]]);

			if (!a || !b) return null;
			if (!Number.isFinite(a[0]) || !Number.isFinite(b[0])) return null;

			const radiansPerPx = geoDistance(a, b);

			if (!Number.isFinite(radiansPerPx) || radiansPerPx === 0) return null;

			const unitsPerPx = radiansPerPx * $.get(earthRadius);

			pxPerUnit = 1 / unitsPerPx;
		}

		// In `canvas` transform mode the projection itself is not re-scaled — the
		// rendered output is visually scaled by `ctx.transform.scale`, so we need
		// to multiply to keep the bar consistent with what the user sees.
		if (ctx.transform?.mode === 'canvas') {
			pxPerUnit *= ctx.transform.scale ?? 1;
		}

		return pxPerUnit;
	});

	function niceDistance(d) {
		if (!(d > 0)) return 0;

		const exp = Math.floor(Math.log10(d));
		const base = Math.pow(10, exp);
		const mantissa = d / base;
		let nice;

		if (mantissa < 1.5) nice = 1; else if (mantissa < 3) nice = 2; else if (mantissa < 7) nice = 5; else nice = 10;

		return nice * base;
	}

	const distance = $.derived(() => {
		if ($$props.distance != null) return $$props.distance;
		if ($.get(pixelsPerUnit) == null) return 0;

		const viewportUnits = ctx.width / $.get(pixelsPerUnit);

		return niceDistance(viewportUnits * 0.25);
	});

	const barWidth = $.derived(() => $.get(pixelsPerUnit) && $.get(distance) > 0 ? $.get(distance) * $.get(pixelsPerUnit) : 0);

	const tickValues = $.derived(() => {
		if ($.get(distance) <= 0) return [];

		return Array.from({ length: ticks() + 1 }, (_, i) => $.get(distance) * i / ticks());
	});

	function formatTick(value) {
		if (typeof $$props.tickFormat === 'function') return $$props.tickFormat(value);
		if ($$props.tickFormat) return format(value, asAny($$props.tickFormat));

		// Default: append unit on the last tick only
		return value === $.get(distance) ? `${value} ${units()}` : String(value);
	}

	const padding = 2;
	const titleHeight = $.derived(() => title() ? titleFontSize() + 6 : 0);
	const tickLabelHeight = $.derived(() => tickFontSize() + 3);
	const width = $.derived(() => Math.ceil($.get(barWidth)) + padding * 2);
	const svgHeight = $.derived(() => $.get(titleHeight) + height() + $.get(tickLabelHeight) + padding * 2 + 3);

	const barY = $.derived(() => labelPlacement() === 'top'
		? $.get(titleHeight) + padding + $.get(tickLabelHeight)
		: $.get(titleHeight) + padding);

	const tickLabelY = $.derived(() => labelPlacement() === 'top'
		? $.get(titleHeight) + padding + tickFontSize()
		: $.get(barY) + height() + 3 + tickFontSize());

	// Single path for the `bracket` variant: outer bracket as one continuous
	// polyline (so corners join cleanly) plus interior ticks. The top rule sits
	// on the opposite side of the labels so the bracket "opens" toward them.
	const bracketPath = $.derived(() => {
		if ($.get(barWidth) <= 0) return '';

		const x0 = padding;
		const x1 = padding + $.get(barWidth);
		const yRule = labelPlacement() === 'top' ? $.get(barY) + height() : $.get(barY);
		const yTicks = labelPlacement() === 'top' ? $.get(barY) : $.get(barY) + height();
		let d = `M${x0},${yTicks}L${x0},${yRule}L${x1},${yRule}L${x1},${yTicks}`;

		for (let i = 1; i < ticks(); i++) {
			const tx = padding + $.get(barWidth) * i / ticks();

			d += `M${tx},${yRule}L${tx},${yTicks}`;
		}

		return d;
	});

	var div = root_6();

	$.attribute_effect(
		div,
		($0) => ({ ...restProps, 'data-placement': $$props.placement, class: $0 }),
		[
			() => cls('lc-geo-legend-container', $$props.class, classes().root)
		],
		void 0,
		void 0,
		'svelte-fxbnq7'
	);

	var node = $.child(div);

	{
		var consequent_4 = ($$anchor) => {
			var svg = root_5();
			var node_1 = $.child(svg);

			{
				var consequent = ($$anchor) => {
					var text = root();

					$.set_attribute(text, 'x', padding);

					let styles;
					var text_1 = $.only_child(text, true);

					$.template_effect(
						($0) => {
							$.set_attribute(text, 'y', titleFontSize());
							$.set_class(text, 0, $0, 'svelte-fxbnq7');
							styles = $.set_style(text, '', styles, { 'font-size': titleFontSize() });
							$.set_text(text_1, title());
						},
						[() => $.clsx(cls('lc-geo-legend-title', classes().title))]
					);

					$.append($$anchor, text);
				};

				$.if(node_1, ($$render) => {
					if (title()) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1);

			{
				var consequent_1 = ($$anchor) => {
					var path = root_1();

					$.set_style(path, '', {}, { fill: 'none' });

					$.template_effect(
						($0) => {
							$.set_attribute(path, 'd', $.get(bracketPath));
							$.set_attribute(path, 'stroke', color());
							$.set_class(path, 0, $0, 'svelte-fxbnq7');
						},
						[() => $.clsx(cls('lc-geo-legend-bar', classes().bar))]
					);

					$.append($$anchor, path);
				};

				var consequent_3 = ($$anchor) => {
					var fragment = root_3();
					var node_3 = $.first_child(fragment);

					$.each(node_3, 17, () => Array.from({ length: ticks() }), $.index, ($$anchor, _, i) => {
						var fragment_1 = $.comment();
						var node_4 = $.first_child(fragment_1);

						{
							var consequent_2 = ($$anchor) => {
								const x1 = $.derived(() => padding + $.get(barWidth) * i / ticks());
								const x2 = $.derived(() => padding + $.get(barWidth) * (i + 1) / ticks());
								var rect = root_2();

								$.template_effect(
									($0) => {
										$.set_attribute(rect, 'x', $.get(x1));
										$.set_attribute(rect, 'y', $.get(barY));
										$.set_attribute(rect, 'width', $.get(x2) - $.get(x1));
										$.set_attribute(rect, 'height', height());
										$.set_attribute(rect, 'fill', color());
										$.set_class(rect, 0, $0, 'svelte-fxbnq7');
									},
									[() => $.clsx(cls('lc-geo-legend-bar', classes().bar))]
								);

								$.append($$anchor, rect);
							};

							$.if(node_4, ($$render) => {
								if (i % 2 === 0) $$render(consequent_2);
							});
						}

						$.append($$anchor, fragment_1);
					});

					var rect_1 = $.sibling(node_3);

					$.set_attribute(rect_1, 'x', padding);
					$.set_style(rect_1, '', {}, { fill: 'none' });

					$.template_effect(
						($0) => {
							$.set_attribute(rect_1, 'y', $.get(barY));
							$.set_attribute(rect_1, 'width', $.get(barWidth));
							$.set_attribute(rect_1, 'height', height());
							$.set_attribute(rect_1, 'stroke', color());
							$.set_class(rect_1, 0, $0, 'svelte-fxbnq7');
						},
						[() => $.clsx(cls('lc-geo-legend-bar', classes().bar))]
					);

					$.append($$anchor, fragment);
				};

				$.if(node_2, ($$render) => {
					if (variant() === 'bracket') $$render(consequent_1); else if (variant() === 'alternating') $$render(consequent_3, 1);
				});
			}

			var g = $.sibling(node_2);

			$.each(g, 21, () => $.get(tickValues), $.index, ($$anchor, value, i) => {
				const x = $.derived(() => padding + $.get(barWidth) * i / ticks());
				var text_2 = root_4();
				let styles_1;
				var text_3 = $.only_child(text_2, true);

				$.template_effect(
					($0, $1) => {
						$.set_attribute(text_2, 'x', $.get(x));
						$.set_attribute(text_2, 'y', $.get(tickLabelY));
						$.set_class(text_2, 0, $0, 'svelte-fxbnq7');
						styles_1 = $.set_style(text_2, '', styles_1, { 'font-size': tickFontSize() });
						$.set_text(text_3, $1);
					},
					[
						() => $.clsx(cls('lc-geo-legend-label', classes().label)),
						() => formatTick($.get(value))
					]
				);

				$.append($$anchor, text_2);
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
			if ($.get(barWidth) > 0) $$render(consequent_4);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));
	$.append($$anchor, div);
	$.pop();
}