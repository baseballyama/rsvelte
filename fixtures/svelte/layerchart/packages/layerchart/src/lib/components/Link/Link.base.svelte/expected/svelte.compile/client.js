import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { curveBumpX, curveBumpY } from 'd3-shape';

import {
	getLinkD3Path,
	getLinkPresetPath,
	getLinkRadialD3Path,
	getLinkRadialPresetPath
} from '$lib/utils/linkUtils.js';

import { getChartContext } from '$lib/contexts/chart.js';
import { getMarkData } from '$lib/contexts/facet.js';
import { accessor } from '$lib/utils/common.js';
import { cls } from '@layerstack/tailwind';
import { createMotion, extractTweenConfig } from '$lib/utils/motion.svelte.js';
import { interpolatePath } from 'd3-interpolate-path';
import { LINK_FALLBACK_COORDS, isAccessorAccessor } from './Link.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Path',
	'x1',
	'y1',
	'x2',
	'y2',
	'data',
	'sankey',
	'source',
	'target',
	'x',
	'y',
	'orientation',
	'curve',
	'type',
	'sweep',
	'radius',
	'bend',
	'radial',
	'marker',
	'markerStart',
	'markerMid',
	'markerEnd',
	'motion',
	'pathRef',
	'pathData',
	'class'
]);

export default function Link_base($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();
	const markData = getMarkData();

	let sankey = $.prop($$props, 'sankey', 3, false),
		type = $.prop($$props, 'type', 3, 'd3'),
		radius = $.prop($$props, 'radius', 3, 20),
		bend = $.prop($$props, 'bend', 3, 22.5),
		pathRef = $.prop($$props, 'pathRef', 15),
		restProps = $.rest_props($$props, rest_excludes);

	const radial = $.derived(() => $$props.radial ?? ctx.radial ?? false);

	const orientation = $.derived(() => {
		if ($$props.orientation) return $$props.orientation;
		if (sankey()) return 'horizontal';

		return 'vertical';
	});

	const curve = $.derived(() => {
		if ($$props.curve) return $$props.curve;
		if ($.get(orientation) === 'horizontal') return curveBumpX;

		return curveBumpY;
	});

	const sweep = $.derived(() => {
		if (type() === 'd3') return $$props.sweep ?? 'none';
		if ($$props.sweep && $$props.sweep !== 'none') return $$props.sweep;

		return $.get(orientation) === 'vertical' ? 'horizontal-vertical' : 'vertical-horizontal';
	});

	const isArrayMode = $.derived(() => isAccessorAccessor($$props.x1) || isAccessorAccessor($$props.y1) || isAccessorAccessor($$props.x2) || isAccessorAccessor($$props.y2));
	const isPixelMode = $.derived(() => !$.get(isArrayMode) && (typeof $$props.x1 === 'number' || typeof $$props.y1 === 'number' || typeof $$props.x2 === 'number' || typeof $$props.y2 === 'number'));

	const sourceAccessor = $.derived(() => {
		if ($$props.source) return $$props.source;
		if (sankey()) return (d) => ({ node: d.source, y: d.y0, isSource: true });

		return (d) => d.source;
	});

	const targetAccessor = $.derived(() => {
		if ($$props.target) return $$props.target;
		if (sankey()) return (d) => ({ node: d.target, y: d.y1, isSource: false });

		return (d) => d.target;
	});

	const xAccessor = $.derived(() => {
		if ($$props.x) return $$props.x;
		if (sankey()) return (d) => d.isSource ? d.node.x1 : d.node.x0;
		if ($.get(radial)) return (d) => d.x;

		return (d) => $.get(orientation) === 'horizontal' ? d.y : d.x;
	});

	const yAccessor = $.derived(() => {
		if ($$props.y) return $$props.y;
		if (sankey()) return (d) => d.y;
		if ($.get(radial)) return (d) => d.y;

		return (d) => $.get(orientation) === 'horizontal' ? d.x : d.y;
	});

	const x1Accessor = $.derived(() => accessor($$props.x1));
	const y1Accessor = $.derived(() => accessor($$props.y1));
	const x2Accessor = $.derived(() => accessor($$props.x2));
	const y2Accessor = $.derived(() => accessor($$props.y2));

	const resolveArrayCoords = (d) => {
		const sxRaw = $.get(x1Accessor)(d);
		const syRaw = $.get(y1Accessor)(d);
		const txRaw = $.get(x2Accessor)(d);
		const tyRaw = $.get(y2Accessor)(d);
		const scaleX = typeof $$props.x1 === 'string' || typeof $$props.x1 === 'function' ? ctx.xScale : null;
		const scaleY = typeof $$props.y1 === 'string' || typeof $$props.y1 === 'function' ? ctx.yScale : null;
		const sx = scaleX && sxRaw != null ? scaleX(sxRaw) : typeof sxRaw === 'number' ? sxRaw : 0;
		const sy = scaleY && syRaw != null ? scaleY(syRaw) : typeof syRaw === 'number' ? syRaw : 0;
		const tx = scaleX && txRaw != null ? scaleX(txRaw) : typeof txRaw === 'number' ? txRaw : 0;
		const ty = scaleY && tyRaw != null ? scaleY(tyRaw) : typeof tyRaw === 'number' ? tyRaw : 0;

		return {
			source: {
				x: Number.isFinite(sx) ? sx : 0,
				y: Number.isFinite(sy) ? sy : 0
			},
			target: {
				x: Number.isFinite(tx) ? tx : 0,
				y: Number.isFinite(ty) ? ty : 0
			}
		};
	};

	const singleSourceCoords = $.derived(() => {
		if ($.get(isPixelMode)) {
			return {
				x: typeof $$props.x1 === 'number' ? $$props.x1 : 0,
				y: typeof $$props.y1 === 'number' ? $$props.y1 : 0
			};
		}

		if (!$$props.data) return LINK_FALLBACK_COORDS;

		try {
			const sourceData = $.get(sourceAccessor)($$props.data);

			if (sourceData == null) return LINK_FALLBACK_COORDS;

			const xVal = $.get(xAccessor)(sourceData);
			const yVal = $.get(yAccessor)(sourceData);

			return {
				x: Number.isFinite(xVal) ? xVal : 0,
				y: Number.isFinite(yVal) ? yVal : 0
			};
		} catch(e) {
			console.error('Error accessing source coordinates:', e, 'Data:', $$props.data);

			return LINK_FALLBACK_COORDS;
		}
	});

	const singleTargetCoords = $.derived(() => {
		if ($.get(isPixelMode)) {
			return {
				x: typeof $$props.x2 === 'number' ? $$props.x2 : 100,
				y: typeof $$props.y2 === 'number' ? $$props.y2 : 100
			};
		}

		if (!$$props.data) return LINK_FALLBACK_COORDS;

		try {
			const targetData = $.get(targetAccessor)($$props.data);

			if (targetData == null) return LINK_FALLBACK_COORDS;

			const xVal = $.get(xAccessor)(targetData);
			const yVal = $.get(yAccessor)(targetData);

			return {
				x: Number.isFinite(xVal) ? xVal : 0,
				y: Number.isFinite(yVal) ? yVal : 0
			};
		} catch(e) {
			console.error('Error accessing target coordinates:', e, 'Data:', $$props.data);

			return LINK_FALLBACK_COORDS;
		}
	});

	function buildPath(source, target) {
		if ($$props.pathData) return $$props.pathData;

		if ($.get(radial)) {
			return type() === 'd3'
				? getLinkRadialD3Path({ source, target, curve: $.get(curve) })
				: getLinkRadialPresetPath({ source, target, type: type(), radius: radius(), bend: bend() });
		}

		if (type() === 'd3') {
			return getLinkD3Path({
				source,
				target,
				sweep: $.get(sweep),
				curve: $.get(curve),
				orientation: $.get(orientation)
			});
		}

		return getLinkPresetPath({
			source,
			target,
			sweep: $.get(sweep),
			type: type(),
			radius: radius(),
			bend: bend()
		});
	}

	const singlePathData = $.derived(() => $.get(isArrayMode)
		? ''
		: buildPath($.get(singleSourceCoords), $.get(singleTargetCoords)));

	const extractedTween = extractTweenConfig($$props.motion);

	const tweenOptions = extractedTween
		? {
			type: extractedTween.type,
			options: { interpolate: interpolatePath, ...extractedTween.options }
		}
		: undefined;

	// Pass `tweenOptions` (possibly undefined) so `createMotion` takes its
	// fast-path passthrough when no tween is configured — avoids allocating
	// a MotionNone container + per-instance `$effect` that fires on every
	// x1/y1/x2/y2 change. Critical for force-simulation graphs which can
	// have hundreds of links updating on every tick.
	const motionPath = createMotion('', () => $.get(singlePathData), tweenOptions);

	// Stable getter handed to `<Path>` instead of `motionPath.current`.
	// Reading `motionPath.current` directly in the template would subscribe
	// *this* component's template to per-tick updates, forcing the entire
	// `<Path>` block to re-evaluate (and re-spread props) on every change.
	// By passing a function reference, the per-tick `current` read happens
	// inside `<Path>`'s own template — the parent stays stable.
	const getPathData = () => motionPath.current;

	const arrayRows = $.derived(() => $.get(isArrayMode) ? markData($$props.data) : []);

	function resolvePerDatum(value, d) {
		return typeof value === 'function' ? value(d) : value;
	}

	function resolveClass(d) {
		return resolvePerDatum($$props.class, d);
	}

	const strokeProp = $.derived(() => $$props.stroke);
	const fillProp = $.derived(() => $$props.fill);
	const strokeWidthProp = $.derived(() => restProps['stroke-width'] ?? $$props.strokeWidth);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => $.get(arrayRows), $.index, ($$anchor, d) => {
				const computed_const = $.derived(() => {
					return resolveArrayCoords($.get(d));
				});

				const resolvedStroke = $.derived(() => resolvePerDatum($.get(strokeProp), $.get(d)) ?? (ctx.config.c ? ctx.cGet($.get(d)) : undefined));
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => buildPath($.get(computed_const).source, $.get(computed_const).target));
					let $1 = $.derived(() => resolvePerDatum($.get(fillProp), $.get(d)));
					let $2 = $.derived(() => resolvePerDatum($.get(strokeWidthProp), $.get(d)));
					let $3 = $.derived(() => cls('lc-link', resolveClass($.get(d))));

					$.component(node_2, () => $$props.Path, ($$anchor, Path_1) => {
						Path_1($$anchor, $.spread_props(
							{
								get pathData() {
									return $.get($0);
								},

								get marker() {
									return $$props.marker;
								},

								get markerStart() {
									return $$props.markerStart;
								},

								get markerMid() {
									return $$props.markerMid;
								},

								get markerEnd() {
									return $$props.markerEnd;
								}
							},
							() => restProps,
							{
								get stroke() {
									return $.get(resolvedStroke);
								},

								get fill() {
									return $.get($1);
								},

								get 'stroke-width'() {
									return $.get($2);
								},

								get class() {
									return $.get($3);
								}
							}
						));
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_3 = $.first_child(fragment_3);

			{
				let $0 = $.derived(() => cls('lc-link', typeof $$props.class === 'string' ? $$props.class : undefined));

				$.component(node_3, () => $$props.Path, ($$anchor, Path_2) => {
					Path_2($$anchor, $.spread_props(
						{
							pathData: getPathData,
							get marker() {
								return $$props.marker;
							},

							get markerStart() {
								return $$props.markerStart;
							},

							get markerMid() {
								return $$props.markerMid;
							},

							get markerEnd() {
								return $$props.markerEnd;
							}
						},
						() => restProps,
						{
							get class() {
								return $.get($0);
							},

							get pathRef() {
								return pathRef();
							},

							set pathRef($$value) {
								pathRef($$value);
							}
						}
					));
				});
			}

			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if ($.get(isArrayMode)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}