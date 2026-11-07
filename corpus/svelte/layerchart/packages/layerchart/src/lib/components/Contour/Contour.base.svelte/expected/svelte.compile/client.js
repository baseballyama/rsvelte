import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { contours as d3Contours } from 'd3-contour';
import { geoPath, geoTransform } from 'd3-geo';
import { scaleSequential } from 'd3-scale';
import { interpolateYlGnBu } from 'd3-scale-chromatic';
import { max, min } from 'd3-array';
import { accessor as resolveAccessor } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getMarkData } from '$lib/contexts/facet.js';
import { getGeoContext } from '$lib/contexts/geo.js';

import {
	blurGridIgnoringNaN,
	gridCellCenterToBounds,
	gridPointToBounds,
	resolveRasterBounds
} from '$lib/utils/index.js';

import { interpolateGrid } from '$lib/utils/rasterInterpolate.js';
import { isScaleOrdinal } from '$lib/utils/scales.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Group',
	'Path',
	'data',
	'width',
	'height',
	'x1',
	'y1',
	'x2',
	'y2',
	'value',
	'x',
	'y',
	'interpolate',
	'thresholds',
	'blur',
	'smooth',
	'fill',
	'fillOpacity',
	'stroke',
	'strokeWidth',
	'opacity',
	'class'
]);

export default function Contour_base($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();
	const markData = getMarkData();
	const geo = getGeoContext();

	let interpolateMethod = $.prop($$props, 'interpolate', 3, 'barycentric'),
		thresholds = $.prop($$props, 'thresholds', 3, 10),
		blurRadius = $.prop($$props, 'blur', 3, 0),
		smooth = $.prop($$props, 'smooth', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	const isGridMode = $.derived(() => !!($$props.data && $$props.width && $$props.height));
	const hasExplicitBounds = $.derived(() => $$props.x1 !== undefined || $$props.y1 !== undefined || $$props.x2 !== undefined || $$props.y2 !== undefined);
	const gridBounds = $.derived(() => resolveRasterBounds($$props.width ?? 0, $$props.height ?? 0, $$props.x1, $$props.y1, $$props.x2, $$props.y2));

	ctx.registerComponent({
		name: 'Contour',
		kind: 'composite-mark',
		markInfo: () => {
			if (!$.get(isGridMode)) return {};

			return {
				data: [
					{ x: $.get(gridBounds).x1, y: $.get(gridBounds).y1 },
					{ x: $.get(gridBounds).x2, y: $.get(gridBounds).y2 }
				],
				x: 'x',
				y: 'y'
			};
		}
	});

	const gridW = $.derived(() => $$props.width ?? Math.min(Math.ceil(ctx.width), 200));
	const gridH = $.derived(() => $$props.height ?? Math.min(Math.ceil(ctx.height), 200));
	const scaleX = $.derived(() => ctx.width / $.get(gridW));
	const scaleY = $.derived(() => ctx.height / $.get(gridH));
	const contourScaleX = $.derived(() => $.get(gridW) / ctx.width);
	const contourScaleY = $.derived(() => $.get(gridH) / ctx.height);
	const useProjectedGridSampling = $.derived(() => !!(geo.projection && $.get(isGridMode) && $.get(hasExplicitBounds)));

	const gridValues = $.derived(() => {
		if (!ctx.width || !ctx.height) return new Float64Array(0);

		if ($.get(isGridMode)) {
			return $$props.data instanceof Float64Array ? $$props.data : Float64Array.from($$props.data);
		}

		if (typeof $$props.value === 'function' && $$props.value.length >= 2) {
			const fn = $$props.value;
			const grid = new Float64Array($.get(gridW) * $.get(gridH));
			const xInvert = ctx.xScale.invert;
			const yInvert = ctx.yScale.invert;

			for (let j = 0; j < $.get(gridH); j++) {
				for (let i = 0; i < $.get(gridW); i++) {
					const px = (i + 0.5) * $.get(scaleX);
					const py = (j + 0.5) * $.get(scaleY);
					const dataX = xInvert ? xInvert(px) : px;
					const dataY = yInvert ? yInvert(py) : py;

					grid[j * $.get(gridW) + i] = fn(dataX, dataY);
				}
			}

			return grid;
		}

		const chartData = markData($$props.data);

		if (!chartData || chartData.length === 0) return new Float64Array(0);

		const xAcc = $$props.x ? resolveAccessor($$props.x) : ctx.x;
		const yAcc = $$props.y ? resolveAccessor($$props.y) : ctx.y;
		const valAcc = resolveAccessor($$props.value ?? 'value');

		const points = chartData.map((d) => [
			ctx.xScale(xAcc(d)) / $.get(scaleX),
			ctx.yScale(yAcc(d)) / $.get(scaleY),
			valAcc(d)
		]);

		return interpolateGrid(points, $.get(gridW), $.get(gridH), interpolateMethod());
	});

	const projectedGridPoints = $.derived(() => {
		if (!$.get(useProjectedGridSampling) || !$$props.width || !$$props.height || !geo.projection) return [];

		const points = [];

		for (let row = 0; row < $$props.height; row++) {
			for (let column = 0; column < $$props.width; column++) {
				const value = $.get(gridValues)[row * $$props.width + column];

				if (!Number.isFinite(value)) continue;

				const point = gridCellCenterToBounds(column, row, $$props.width, $$props.height, $.get(gridBounds));
				const projected = geo.projection([point.x, point.y]);

				if (!projected || !Number.isFinite(projected[0]) || !Number.isFinite(projected[1])) continue;

				points.push([
					projected[0] * $.get(contourScaleX),
					projected[1] * $.get(contourScaleY),
					value
				]);
			}
		}

		return points;
	});

	const contourGridValues = $.derived(() => {
		if ($.get(useProjectedGridSampling)) {
			return interpolateGrid($.get(projectedGridPoints), $.get(gridW), $.get(gridH), interpolateMethod());
		}

		return $.get(gridValues);
	});

	const blurredValues = $.derived(() => {
		if (!blurRadius() || $.get(contourGridValues).length === 0) return $.get(contourGridValues);

		return blurGridIgnoringNaN($.get(contourGridValues), $.get(gridW), $.get(gridH), blurRadius());
	});

	const contourData = $.derived(() => {
		if ($.get(blurredValues).length === 0) return [];

		const generator = d3Contours().size([$.get(gridW), $.get(gridH)]).smooth(smooth());

		generator.thresholds(thresholds());

		return generator(Array.from($.get(blurredValues)));
	});

	const pathGenerator = $.derived(() => {
		if ($.get(useProjectedGridSampling)) {
			return geoPath(geoTransform({
				point(x, y) {
					this.stream.point(x * $.get(scaleX), y * $.get(scaleY));
				}
			}));
		}

		if ($.get(isGridMode) && $.get(hasExplicitBounds)) {
			return geoPath(geoTransform({
				point(x, y) {
					const point = gridPointToBounds(x, y, $.get(gridW), $.get(gridH), $.get(gridBounds));

					this.stream.point(ctx.xScale(point.x), ctx.yScale(point.y));
				}
			}));
		}

		if ($.get(scaleX) === 1 && $.get(scaleY) === 1) return geoPath();

		return geoPath(geoTransform({
			point(x, y) {
				this.stream.point(x * $.get(scaleX), y * $.get(scaleY));
			}
		}));
	});

	const colorScale = $.derived(() => {
		if ($$props.fill) return null;

		const minValue = min($.get(contourData), (d) => d.value) ?? 0;
		const maxValue = max($.get(contourData), (d) => d.value) ?? 1;

		// Not an ordinal scale — `cScale` defaults to a `series` color lookup, which can't ramp
		if (ctx.cScale && !isScaleOrdinal(ctx.cScale)) {
			const scale = ctx.cScale.copy();

			return ctx.props.cDomain ? scale : scale.domain([minValue, maxValue]);
		}

		return scaleSequential([minValue, maxValue], interpolateYlGnBu);
	});

	function getContourFill(contour) {
		if ($$props.fill) return $$props.fill;

		return $.get(colorScale)
			? String($.get(colorScale)(contour.value))
			: 'steelblue';
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => $$props.Group, ($$anchor, Group_1) => {
				Group_1($$anchor, {
					class: 'lc-contour',
					get opacity() {
						return $$props.opacity;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.each(node_2, 17, () => $.get(contourData), $.index, ($$anchor, contour) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => $.get(pathGenerator)($.get(contour)) ?? '');
								let $1 = $.derived(() => getContourFill($.get(contour)));
								let $2 = $.derived(() => cls('lc-contour-band', $$props.class));

								$.component(node_3, () => $$props.Path, ($$anchor, Path_1) => {
									Path_1($$anchor, {
										get pathData() {
											return $.get($0);
										},

										get fill() {
											return $.get($1);
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

										get class() {
											return $.get($2);
										}
									});
								});
							}

							$.append($$anchor, fragment_3);
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(contourData).length > 0) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}