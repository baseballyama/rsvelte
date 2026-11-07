import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { RectState, rectMarkInfo } from './Rect.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'x',
	'y',
	'width',
	'height',
	'rx',
	'ry',
	'children'
]);

var root = $.from_svg(`<path></path>`);
var root_1 = $.from_svg(`<rect></rect>`);

export default function Rect_svg($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		// Pull out props that collide with `<rect>` SVG attribute names so
		// `{...rest}` spread doesn't override our explicit values.
		rest = $.rest_props($$props, rest_excludes);

	const c = new RectState(() => ({
		x: $$props.x,
		y: $$props.y,
		width: $$props.width,
		height: $$props.height,
		rx: $$props.rx,
		ry: $$props.ry,
		...rest
	}));

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	c.chartCtx.registerComponent({
		name: 'Rect',
		kind: 'mark',
		markInfo: () => rectMarkInfo(
			{
				x: $$props.x,
				y: $$props.y,
				width: $$props.width,
				height: $$props.height,
				rx: $$props.rx,
				ry: $$props.ry,
				...rest
			},
			c.dataMode
		)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => c.resolvedItems, (item) => item.key, ($$anchor, item) => {
				const resolvedFill = $.derived(() => resolveColorProp($$props.fill, $.get(item).d, c.chartCtx.cScale));
				const resolvedStroke = $.derived(() => resolveColorProp($$props.stroke, $.get(item).d, c.chartCtx.cScale));
				const resolvedFillOpacity = $.derived(() => resolveStyleProp($$props.fillOpacity, $.get(item).d));
				const resolvedStrokeOpacity = $.derived(() => resolveStyleProp($$props.strokeOpacity, $.get(item).d));
				const resolvedStrokeWidth = $.derived(() => resolveStyleProp($$props.strokeWidth, $.get(item).d));
				const resolvedOpacity = $.derived(() => resolveStyleProp($$props.opacity, $.get(item).d));
				const resolvedClass = $.derived(() => resolveStyleProp($$props.class, $.get(item).d));
				const pathData = $.derived(() => c.roundedRectPath($.get(item).x, $.get(item).y, $.get(item).width, $.get(item).height));
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						var path = root();

						$.attribute_effect(
							path,
							($0) => ({
								...rest,
								d: $.get(pathData),
								fill: $.get(resolvedFill),
								'fill-opacity': $.get(resolvedFillOpacity),
								stroke: $.get(resolvedStroke),
								'stroke-opacity': $.get(resolvedStrokeOpacity),
								'stroke-width': $.get(resolvedStrokeWidth),
								opacity: $.get(resolvedOpacity),
								'stroke-dasharray': c.dashArrayAttr,
								class: $0
							}),
							[() => cls('lc-rect', $.get(resolvedClass))]
						);

						$.append($$anchor, path);
					};

					var alternate = ($$anchor) => {
						var rect = root_1();

						$.attribute_effect(
							rect,
							($0) => ({
								...rest,
								x: $.get(item).x,
								y: $.get(item).y,
								width: $.get(item).width,
								height: $.get(item).height,
								fill: $.get(resolvedFill),
								'fill-opacity': $.get(resolvedFillOpacity),
								stroke: $.get(resolvedStroke),
								'stroke-opacity': $.get(resolvedStrokeOpacity),
								'stroke-width': $.get(resolvedStrokeWidth),
								opacity: $.get(resolvedOpacity),
								rx: c.rx,
								ry: c.ry,
								'stroke-dasharray': c.dashArrayAttr,
								class: $0
							}),
							[() => cls('lc-rect', $.get(resolvedClass))]
						);

						$.append($$anchor, rect);
					};

					$.if(node_2, ($$render) => {
						if ($.get(pathData)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		var consequent_2 = ($$anchor) => {
			var path_1 = root();

			$.attribute_effect(
				path_1,
				($0) => ({
					...rest,
					d: c.pixelPathData,
					fill: c.staticFill,
					'fill-opacity': c.staticFillOpacity,
					stroke: c.staticStroke,
					'stroke-opacity': c.staticStrokeOpacity,
					'stroke-width': c.staticStrokeWidth,
					opacity: c.staticOpacity,
					'stroke-dasharray': c.dashArrayAttr,
					class: $0
				}),
				[() => cls('lc-rect', c.staticClassName)]
			);

			$.append($$anchor, path_1);
		};

		var alternate_1 = ($$anchor) => {
			var rect_1 = root_1();

			$.attribute_effect(
				rect_1,
				($0) => ({
					...rest,
					x: c.motionX,
					y: c.motionY,
					width: c.motionWidth,
					height: c.motionHeight,
					fill: c.staticFill,
					'fill-opacity': c.staticFillOpacity,
					stroke: c.staticStroke,
					'stroke-opacity': c.staticStrokeOpacity,
					'stroke-width': c.staticStrokeWidth,
					opacity: c.staticOpacity,
					rx: c.rx,
					ry: c.ry,
					'stroke-dasharray': c.dashArrayAttr,
					class: $0
				}),
				[() => cls('lc-rect', c.staticClassName)]
			);

			$.bind_this(rect_1, ($$value) => $.set(ref, $$value), () => $.get(ref));
			$.append($$anchor, rect_1);
		};

		$.if(node, ($$render) => {
			if (c.dataMode) $$render(consequent_1); else if (c.pixelPathData) $$render(consequent_2, 1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}