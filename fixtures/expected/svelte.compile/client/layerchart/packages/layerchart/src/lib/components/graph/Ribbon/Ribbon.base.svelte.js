import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ribbon as d3ribbon, ribbonArrow as d3ribbonArrow } from 'd3-chord';
import { getChartContext } from '$lib/contexts/chart.js';
import { cls } from '@layerstack/tailwind';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Path',
	'chord',
	'radius',
	'directed',
	'headRadius',
	'fill',
	'fillOpacity',
	'stroke',
	'strokeWidth',
	'opacity',
	'data',
	'onpointerenter',
	'onpointermove',
	'onpointerleave',
	'ontouchmove',
	'tooltip',
	'motion',
	'class'
]);

export default function Ribbon_base($$anchor, $$props) {
	$.push($$props, true);

	let directed = $.prop($$props, 'directed', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const ctx = getChartContext();

	const ribbonGenerator = $.derived(() => {
		if (directed()) {
			const gen = d3ribbonArrow();

			if ($$props.radius != null) gen.radius($$props.radius);
			if ($$props.headRadius != null) gen.headRadius($$props.headRadius);

			return gen;
		} else {
			const gen = d3ribbon();

			if ($$props.radius != null) gen.radius($$props.radius);

			return gen;
		}
	});

	// @ts-expect-error - Chord type is compatible with Ribbon at runtime; radius is set on the generator
	const pathData = $.derived(() => $.get(ribbonGenerator)($$props.chord) ?? undefined);

	const onPointerEnter = (e) => {
		$$props.onpointerenter?.(e);

		if ($$props.tooltip) ctx.tooltip.show(e, $$props.data);
	};

	const onPointerMove = (e) => {
		$$props.onpointermove?.(e);

		if ($$props.tooltip) ctx.tooltip.show(e, $$props.data);
	};

	const onPointerLeave = (e) => {
		$$props.onpointerleave?.(e);

		if ($$props.tooltip) ctx.tooltip.hide();
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cls('lc-ribbon', $$props.class));

		$.component(node, () => $$props.Path, ($$anchor, Path_1) => {
			Path_1($$anchor, $.spread_props(
				{
					get pathData() {
						return $.get(pathData);
					},

					get fill() {
						return $$props.fill;
					},

					get fillOpacity() {
						return $$props.fillOpacity;
					},

					get stroke() {
						return $$props.stroke;
					},

					get strokeWidth() {
						return $$props.strokeWidth;
					},

					get opacity() {
						return $$props.opacity;
					},

					get motion() {
						return $$props.motion;
					}
				},
				() => restProps,
				{
					get class() {
						return $.get($0);
					},
					onpointerenter: onPointerEnter,
					onpointermove: onPointerMove,
					onpointerleave: onPointerLeave,
					ontouchmove: (e) => {
						$$props.ontouchmove?.(e);

						if ($$props.tooltip) {
							e.preventDefault();
						}
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}