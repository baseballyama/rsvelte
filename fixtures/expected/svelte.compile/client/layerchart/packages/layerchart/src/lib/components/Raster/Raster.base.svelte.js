import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { scaleSequential } from 'd3-scale';
import { interpolateYlGnBu } from 'd3-scale-chromatic';
import { max, min } from 'd3-array';
import { rgb } from 'd3-color';
import { accessor as resolveAccessor } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getMarkData } from '$lib/contexts/facet.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import { gridCellCenterToBounds, resolveRasterBounds } from '$lib/utils/index.js';
import { interpolateGrid } from '$lib/utils/rasterInterpolate.js';
import { isScaleOrdinal } from '$lib/utils/scales.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Image',
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
	'pixelSize',
	'blur',
	'imageRendering',
	'opacity',
	'class'
]);

export default function Raster_base($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();
	const markData = getMarkData();
	const geo = getGeoContext();

	let interpolateMethod = $.prop($$props, 'interpolate', 3, 'barycentric'),
		pixelSize = $.prop($$props, 'pixelSize', 3, 1),
		blurRadius = $.prop($$props, 'blur', 3, 0),
		imageRendering = $.prop($$props, 'imageRendering', 3, 'auto'),
		restProps = $.rest_props($$props, rest_excludes);

	const isGridMode = $.derived(() => !!($$props.data && $$props.width && $$props.height));
	const hasExplicitBounds = $.derived(() => $$props.x1 !== undefined || $$props.y1 !== undefined || $$props.x2 !== undefined || $$props.y2 !== undefined);
	const gridBounds = $.derived(() => resolveRasterBounds($$props.width ?? 0, $$props.height ?? 0, $$props.x1, $$props.y1, $$props.x2, $$props.y2));
	const useProjectedGridSampling = $.derived(() => !!(geo.projection && geo.projection.invert && $.get(isGridMode) && $.get(hasExplicitBounds)));

	ctx.registerComponent({
		name: 'Raster',
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

	const gridW = $.derived(() => $$props.width ?? Math.max(1, Math.ceil(ctx.width / pixelSize())));
	const gridH = $.derived(() => $$props.height ?? Math.max(1, Math.ceil(ctx.height / pixelSize())));
	const scaleX = $.derived(() => ctx.width / $.get(gridW));
	const scaleY = $.derived(() => ctx.height / $.get(gridH));
	const rasterScaleX = $.derived(() => $.get(gridW) / ctx.width);
	const rasterScaleY = $.derived(() => $.get(gridH) / ctx.height);

	const sourceGridValues = $.derived(() => {
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
				const value = $.get(sourceGridValues)[row * $$props.width + column];

				if (!Number.isFinite(value)) continue;

				const point = gridCellCenterToBounds(column, row, $$props.width, $$props.height, $.get(gridBounds));
				const projected = geo.projection([point.x, point.y]);

				if (!projected || !Number.isFinite(projected[0]) || !Number.isFinite(projected[1])) continue;

				points.push([
					projected[0] * $.get(rasterScaleX),
					projected[1] * $.get(rasterScaleY),
					value
				]);
			}
		}

		return points;
	});

	const rasterValues = $.derived(() => {
		if ($.get(useProjectedGridSampling)) {
			return interpolateGrid($.get(projectedGridPoints), $.get(gridW), $.get(gridH), interpolateMethod());
		}

		return $.get(sourceGridValues);
	});

	const colorScale = $.derived(() => {
		const validValues = $.get(rasterValues).filter((v) => !isNaN(v));
		const minValue = min(validValues) ?? 0;
		const maxValue = max(validValues) ?? 1;

		// Not an ordinal scale — `cScale` defaults to a `series` color lookup, which can't ramp
		if (ctx.cScale && !isScaleOrdinal(ctx.cScale)) {
			const scale = ctx.cScale.copy();

			return ctx.props.cDomain ? scale : scale.domain([minValue, maxValue]);
		}

		return scaleSequential([minValue, maxValue], interpolateYlGnBu);
	});

	const LUT_SIZE = 256;

	const colorLut = $.derived(() => {
		const lut = new Uint8ClampedArray(LUT_SIZE * 4);

		for (let i = 0; i < LUT_SIZE; i++) {
			const t = i / (LUT_SIZE - 1);
			const [lo, hi] = $.get(colorScale).domain();
			const value = lo + t * (hi - lo);
			const c = rgb(String($.get(colorScale)(value)));

			lut[i * 4] = c.r;
			lut[i * 4 + 1] = c.g;
			lut[i * 4 + 2] = c.b;
			lut[i * 4 + 3] = 255;
		}

		return lut;
	});

	const imagePlacement = $.derived(() => {
		if ($.get(useProjectedGridSampling)) {
			return {
				x: ctx.width / 2,
				y: ctx.height / 2,
				width: ctx.width,
				height: ctx.height
			};
		}

		if ($.get(isGridMode) && $.get(hasExplicitBounds)) {
			const x1 = ctx.xScale($.get(gridBounds).x1);
			const x2 = ctx.xScale($.get(gridBounds).x2);
			const y1 = ctx.yScale($.get(gridBounds).y1);
			const y2 = ctx.yScale($.get(gridBounds).y2);

			return {
				x: (x1 + x2) / 2,
				y: (y1 + y2) / 2,
				width: Math.abs(x2 - x1),
				height: Math.abs(y2 - y1)
			};
		}

		return {
			x: ctx.width / 2,
			y: ctx.height / 2,
			width: ctx.width,
			height: ctx.height
		};
	});

	const imageDataUrl = $.derived(() => {
		if (typeof document === 'undefined') return '';
		if ($.get(rasterValues).length === 0 || $.get(gridW) <= 0 || $.get(gridH) <= 0) return '';

		const [minValue, maxValue] = $.get(colorScale).domain();
		const range = maxValue - minValue || 1;
		const canvas = document.createElement('canvas');

		canvas.width = $.get(gridW);
		canvas.height = $.get(gridH);

		const canvasCtx = canvas.getContext('2d');
		const imageData = canvasCtx.createImageData($.get(gridW), $.get(gridH));
		const pixels = imageData.data;

		for (let i = 0; i < $.get(rasterValues).length; i++) {
			const v = $.get(rasterValues)[i];
			const offset = i * 4;

			if (isNaN(v)) {
				pixels[offset] = 0;
				pixels[offset + 1] = 0;
				pixels[offset + 2] = 0;
				pixels[offset + 3] = 0;

				continue;
			}

			const t = Math.max(0, Math.min(1, (v - minValue) / range));
			const lutIndex = Math.round(t * (LUT_SIZE - 1));
			const lutOffset = lutIndex * 4;

			pixels[offset] = $.get(colorLut)[lutOffset];
			pixels[offset + 1] = $.get(colorLut)[lutOffset + 1];
			pixels[offset + 2] = $.get(colorLut)[lutOffset + 2];
			pixels[offset + 3] = $.get(colorLut)[lutOffset + 3];
		}

		canvasCtx.putImageData(imageData, 0, 0);

		if (blurRadius() > 0) {
			const blurredCanvas = document.createElement('canvas');

			blurredCanvas.width = $.get(gridW);
			blurredCanvas.height = $.get(gridH);

			const blurredCtx = blurredCanvas.getContext('2d');

			blurredCtx.filter = `blur(${blurRadius()}px)`;
			blurredCtx.drawImage(canvas, 0, 0);

			return blurredCanvas.toDataURL();
		}

		return canvas.toDataURL();
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cls('lc-raster', $$props.class));

				$.component(node_1, () => $$props.Image, ($$anchor, Image_1) => {
					Image_1($$anchor, {
						get href() {
							return $.get(imageDataUrl);
						},

						get x() {
							return $.get(imagePlacement).x;
						},

						get y() {
							return $.get(imagePlacement).y;
						},

						get width() {
							return $.get(imagePlacement).width;
						},

						get height() {
							return $.get(imagePlacement).height;
						},

						get imageRendering() {
							return imageRendering();
						},

						get opacity() {
							return $$props.opacity;
						},
						preserveAspectRatio: 'none',
						get class() {
							return $.get($0);
						}
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(imageDataUrl)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}