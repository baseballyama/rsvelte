import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { resolveStyleProp } from '$lib/utils/dataProp.js';
import { BarState } from './Bar.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Rect',
	'Arc',
	'data',
	'x',
	'y',
	'x1',
	'y1',
	'seriesKey',
	'stackPadding',
	'fill',
	'fillOpacity',
	'stroke',
	'strokeWidth',
	'opacity',
	'radius',
	'rounded',
	'motion',
	'insets',
	'initialX',
	'initialY',
	'initialHeight',
	'initialWidth',
	'width',
	'height',
	'tooltip',
	'onpointerenter',
	'onpointermove',
	'onpointerleave'
]);

export default function Bar_base($$anchor, $$props) {
	$.push($$props, true);

	let stackPadding = $.prop($$props, 'stackPadding', 3, 0),
		strokeProp = $.prop($$props, 'stroke', 3, 'black'),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 0),
		radius = $.prop($$props, 'radius', 3, 0),
		rounded = $.prop($$props, 'rounded', 3, 'all'),
		restProps = $.rest_props($$props, rest_excludes);

	const stroke = $.derived(() => strokeProp() === null || strokeProp() === undefined ? 'black' : strokeProp());

	/**
	 * A bar draws one row, so its style props take an accessor the same way `Rect` and `Circle` do.
	 * Resolved here rather than passed down, because the `Rect` below is handed computed dimensions
	 * and so never sees the row itself.
	 *
	 * `fill` / `stroke` are left alone — a bar's color comes from `c` / the series, which already
	 * resolves per row.
	 */
	const resolvedFillOpacity = $.derived(() => resolveStyleProp($$props.fillOpacity, $$props.data));

	const resolvedStrokeWidth = $.derived(() => resolveStyleProp(strokeWidth(), $$props.data));
	const resolvedOpacity = $.derived(() => resolveStyleProp($$props.opacity, $$props.data));

	const c = new BarState(() => ({
		data: $$props.data,
		x: $$props.x,
		y: $$props.y,
		x1: $$props.x1,
		y1: $$props.y1,
		seriesKey: $$props.seriesKey,
		stackPadding: stackPadding(),
		radius: radius(),
		rounded: rounded(),
		motion: $$props.motion,
		insets: $$props.insets,
		initialX: $$props.initialX,
		initialY: $$props.initialY,
		initialHeight: $$props.initialHeight,
		initialWidth: $$props.initialWidth,
		width: $$props.width,
		height: $$props.height,
		tooltip: $$props.tooltip
	}));

	const onPointerEnter = (e) => {
		$$props.onpointerenter?.(e);

		if ($$props.tooltip) c.ctx.tooltip.show(e, $$props.data);
	};

	const onPointerMove = (e) => {
		$$props.onpointermove?.(e);

		if ($$props.tooltip) c.ctx.tooltip.show(e, $$props.data);
	};

	const onPointerLeave = (e) => {
		$$props.onpointerleave?.(e);

		if ($$props.tooltip) c.ctx.tooltip.hide();
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => c.dimensions.y + c.dimensions.height);
				let $1 = $.derived(() => c.dimensions.x + c.dimensions.width);
				let $2 = $.derived(() => extractLayerProps(restProps, 'lc-bar'));

				$.component(node_1, () => $$props.Arc, ($$anchor, Arc_1) => {
					Arc_1($$anchor, $.spread_props(
						{
							get innerRadius() {
								return c.dimensions.y;
							},

							get outerRadius() {
								return $.get($0);
							},

							get startAngle() {
								return c.dimensions.x;
							},

							get endAngle() {
								return $.get($1);
							},

							get fill() {
								return $$props.fill;
							},

							get fillOpacity() {
								return $.get(resolvedFillOpacity);
							},

							get stroke() {
								return $.get(stroke);
							},

							get strokeWidth() {
								return $.get(resolvedStrokeWidth);
							},

							get opacity() {
								return $.get(resolvedOpacity);
							},

							get cornerRadius() {
								return radius();
							},
							onpointerenter: onPointerEnter,
							onpointermove: onPointerMove,
							onpointerleave: onPointerLeave
						},
						() => $.get($2)
					));
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => extractLayerProps(restProps, 'lc-bar'));

				$.component(node_2, () => $$props.Rect, ($$anchor, Rect_1) => {
					Rect_1($$anchor, $.spread_props(
						{
							get fill() {
								return $$props.fill;
							},

							get fillOpacity() {
								return $.get(resolvedFillOpacity);
							},

							get stroke() {
								return $.get(stroke);
							},

							get strokeWidth() {
								return $.get(resolvedStrokeWidth);
							},

							get opacity() {
								return $.get(resolvedOpacity);
							},

							get corners() {
								return c.corners;
							},

							get motion() {
								return $$props.motion;
							},

							get initialX() {
								return c.resolvedInitialX;
							},

							get initialY() {
								return c.resolvedInitialY;
							},

							get initialHeight() {
								return c.resolvedInitialHeight;
							},

							get initialWidth() {
								return c.resolvedInitialWidth;
							}
						},
						() => c.dimensions,
						{
							onpointerenter: onPointerEnter,
							onpointermove: onPointerMove,
							onpointerleave: onPointerLeave
						},
						() => $.get($0)
					));
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if (c.ctx.radial && $$props.Arc) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}