import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { CircleState, circleMarkInfo } from './Circle.shared.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_svg(`<circle></circle>`);

export default function Circle_svg($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	const c = new CircleState(() => rest);
	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	c.chartCtx.registerComponent({
		name: 'Circle',
		kind: 'mark',
		markInfo: () => circleMarkInfo(rest, c.dataMode)
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
				var circle = root();

				$.attribute_effect(
					circle,
					($0) => ({
						...rest,
						cx: $.get(item).cx,
						cy: $.get(item).cy,
						r: $.get(item).r,
						fill: $.get(resolvedFill),
						'fill-opacity': $.get(resolvedFillOpacity),
						stroke: $.get(resolvedStroke),
						'stroke-width': $.get(resolvedStrokeWidth),
						opacity: $.get(resolvedOpacity),
						'stroke-dasharray': c.dashArrayAttr,
						class: $0
					}),
					[() => cls('lc-circle', $.get(resolvedClass))]
				);

				$.append($$anchor, circle);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var circle_1 = root();

			$.attribute_effect(
				circle_1,
				($0) => ({
					...rest,
					cx: c.motionCx,
					cy: c.motionCy,
					r: c.motionR,
					fill: c.staticFill,
					'fill-opacity': c.staticFillOpacity,
					stroke: c.staticStroke,
					'stroke-width': c.staticStrokeWidth,
					opacity: c.staticOpacity,
					'stroke-dasharray': c.dashArrayAttr,
					class: $0
				}),
				[() => cls('lc-circle', c.staticClassName)]
			);

			$.bind_this(circle_1, ($$value) => $.set(ref, $$value), () => $.get(ref));
			$.append($$anchor, circle_1);
		};

		$.if(node, ($$render) => {
			if (c.dataMode) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}