import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { PolygonState, polygonMarkInfo } from './Polygon.shared.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_svg(`<path></path>`);

export default function Polygon_svg($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	const c = new PolygonState(() => rest);
	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	c.chartCtx.registerComponent({
		name: 'Polygon',
		kind: 'mark',
		markInfo: () => polygonMarkInfo(rest, c.dataMode)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 19, () => c.resolvedData, (d, i) => $$props.key ? $$props.key(d, i) : i, ($$anchor, d) => {
				const pathData = $.derived(() => c.resolvePolygonPath($.get(d)));
				const resolvedFill = $.derived(() => resolveColorProp($$props.fill, $.get(d), c.chartCtx.cScale));
				const resolvedStroke = $.derived(() => resolveColorProp($$props.stroke, $.get(d), c.chartCtx.cScale));
				const resolvedFillOpacity = $.derived(() => resolveStyleProp($$props.fillOpacity, $.get(d)));
				const resolvedStrokeWidth = $.derived(() => resolveStyleProp($$props.strokeWidth, $.get(d)));
				const resolvedOpacity = $.derived(() => resolveStyleProp($$props.opacity, $.get(d)));
				const resolvedClass = $.derived(() => resolveStyleProp($$props.class, $.get(d)));
				var path = root();

				$.attribute_effect(
					path,
					($0) => ({
						...rest,
						d: $.get(pathData),
						fill: $.get(resolvedFill),
						'fill-opacity': $.get(resolvedFillOpacity),
						stroke: $.get(resolvedStroke),
						'stroke-width': $.get(resolvedStrokeWidth),
						opacity: $.get(resolvedOpacity),
						class: $0
					}),
					[() => cls('lc-polygon', $.get(resolvedClass))]
				);

				$.append($$anchor, path);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var path_1 = root();

			$.attribute_effect(
				path_1,
				($0) => ({
					...rest,
					d: c.tweenedPathData,
					fill: c.staticFill,
					'fill-opacity': c.staticFillOpacity,
					stroke: c.staticStroke,
					'stroke-width': c.staticStrokeWidth,
					opacity: c.staticOpacity,
					class: $0
				}),
				[() => cls('lc-polygon', c.staticClassName)]
			);

			$.bind_this(path_1, ($$value) => $.set(ref, $$value), () => $.get(ref));
			$.append($$anchor, path_1);
		};

		$.if(node, ($$render) => {
			if (c.dataMode) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}