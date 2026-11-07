import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { EllipseState, ellipseMarkInfo } from './Ellipse.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'cx',
	'cy',
	'rx',
	'ry'
]);

var root = $.from_svg(`<ellipse></ellipse>`);

export default function Ellipse_svg($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		// Pull out props that collide with `<ellipse>` SVG attribute names
		rest = $.rest_props($$props, rest_excludes);

	const c = new EllipseState(() => ({
		cx: $$props.cx,
		cy: $$props.cy,
		rx: $$props.rx,
		ry: $$props.ry,
		...rest
	}));

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	c.chartCtx.registerComponent({
		name: 'Ellipse',
		kind: 'mark',
		markInfo: () => ellipseMarkInfo(
			{
				cx: $$props.cx,
				cy: $$props.cy,
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
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => c.resolvedItems, (item) => item.key, ($$anchor, item) => {
				const resolvedFill = $.derived(() => resolveColorProp($$props.fill, $.get(item).d, c.chartCtx.cScale));
				const resolvedStroke = $.derived(() => resolveColorProp($$props.stroke, $.get(item).d, c.chartCtx.cScale));
				const resolvedFillOpacity = $.derived(() => resolveStyleProp($$props.fillOpacity, $.get(item).d));
				const resolvedStrokeWidth = $.derived(() => resolveStyleProp($$props.strokeWidth, $.get(item).d));
				const resolvedOpacity = $.derived(() => resolveStyleProp($$props.opacity, $.get(item).d));
				const resolvedClass = $.derived(() => resolveStyleProp($$props.class, $.get(item).d));
				var ellipse = root();

				$.attribute_effect(
					ellipse,
					($0) => ({
						...rest,
						cx: $.get(item).cx,
						cy: $.get(item).cy,
						rx: $.get(item).rx,
						ry: $.get(item).ry,
						fill: $.get(resolvedFill),
						'fill-opacity': $.get(resolvedFillOpacity),
						stroke: $.get(resolvedStroke),
						'stroke-width': $.get(resolvedStrokeWidth),
						opacity: $.get(resolvedOpacity),
						class: $0
					}),
					[() => cls('lc-ellipse', $.get(resolvedClass))]
				);

				$.append($$anchor, ellipse);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var ellipse_1 = root();

			$.attribute_effect(
				ellipse_1,
				($0) => ({
					...rest,
					cx: c.motionCx,
					cy: c.motionCy,
					rx: c.motionRx,
					ry: c.motionRy,
					fill: c.staticFill,
					'fill-opacity': c.staticFillOpacity,
					stroke: c.staticStroke,
					'stroke-width': c.staticStrokeWidth,
					opacity: c.staticOpacity,
					class: $0
				}),
				[() => cls('lc-ellipse', c.staticClassName)]
			);

			$.bind_this(ellipse_1, ($$value) => $.set(ref, $$value), () => $.get(ref));
			$.append($$anchor, ellipse_1);
		};

		$.if(node, ($$render) => {
			if (c.dataMode) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}