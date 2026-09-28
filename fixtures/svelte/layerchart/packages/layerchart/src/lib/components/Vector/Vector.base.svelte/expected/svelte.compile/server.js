import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import { getChartContext } from '$lib/contexts/chart.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import { createMotion, createDataMotionMap } from '$lib/utils/motion.svelte.js';

import {
	hasAnyDataProp,
	resolveDataProp,
	extractRawDataValue,
	resolveGeoDataPair,
	resolveStyleProp,
	resolveColorProp
} from '$lib/utils/dataProp.js';

import { chartDataArray } from '$lib/utils/common.js';
import { cls } from '@layerstack/tailwind';

import {
	vectorArrowPath,
	vectorArrowFilledPath,
	vectorSpikePath,
	transformVectorPath
} from '$lib/utils/path.js';

export default function Vector_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Path,
			x = 0,
			initialX: initialXProp,
			y = 0,
			initialY: initialYProp,
			length: lengthProp = 12,
			initialLength: initialLengthProp,
			rotate: rotateProp = 0,
			shape = 'arrow',
			anchor,
			width,
			children,
			data: dataProp,
			key: keyFn = (_, i) => i,
			motion,
			fill,
			fillOpacity,
			stroke,
			strokeWidth,
			opacity,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const isFilled = $.derived(() => shape === 'spike' || shape === 'arrow-filled');
		const resolvedAnchor = $.derived(() => anchor ?? (isFilled() ? 'start' : 'middle'));
		const dataMode = $.derived(() => hasAnyDataProp(x, y, lengthProp, rotateProp));
		const hasPerItemStyles = $.derived(() => typeof fill === 'function' || typeof stroke === 'function' || typeof fillOpacity === 'function' || typeof strokeWidth === 'function' || typeof opacity === 'function' || typeof className === 'function');
		const chartCtx = getChartContext();
		const geo = getGeoContext();
		const resolvedData = $.derived(() => dataMode() ? dataProp ?? chartDataArray(chartCtx.data) : []);

		function resolveVector(d) {
			let resolvedX, resolvedY;

			if (geo.projection) {
				[resolvedX, resolvedY] = resolveGeoDataPair(x, y, d, geo.projection);
			} else {
				resolvedX = resolveDataProp(x, d, chartCtx.xScale, 0);
				resolvedY = resolveDataProp(y, d, chartCtx.yScale, 0);
			}

			return {
				x: resolvedX,
				y: resolvedY,
				length: resolveDataProp(lengthProp, d, chartCtx.rScale, typeof lengthProp === 'number' ? lengthProp : 12),
				rotate: typeof rotateProp === 'number' ? rotateProp : extractRawDataValue(rotateProp, d) ?? 0
			};
		}

		const dataMotionMap = createDataMotionMap(motion);

		if (dataMotionMap) {}

		const resolvedItems = $.derived(() => {
			if (!dataMode()) return [];

			return resolvedData().map((d, i) => {
				const key = keyFn(d, i);
				const resolved = resolveVector(d);
				const animated = dataMotionMap?.get(key);

				return {
					d,
					key,
					x: animated?.x ?? resolved.x,
					y: animated?.y ?? resolved.y,
					length: animated?.length ?? resolved.length,
					rotate: resolved.rotate
				};
			});
		});

		function getAnchorOffset(len) {
			switch (resolvedAnchor()) {
				case 'start':
					return 0;

				case 'end':
					return len;

				case 'middle':

				default:
					return len / 2;
			}
		}

		function getLocalPathData(len) {
			const w = width ?? len * 0.25;

			if (shape === 'spike') {
				return vectorSpikePath({ length: len, anchor: resolvedAnchor(), width: w });
			}

			if (shape === 'arrow-filled') {
				return vectorArrowFilledPath({ length: len, anchor: resolvedAnchor(), width: w });
			}

			return vectorArrowPath({ length: len, anchor: resolvedAnchor(), width: w });
		}

		function getAbsolutePathData(itemX, itemY, len, rot) {
			return transformVectorPath(getLocalPathData(len), itemX, itemY, rot);
		}

		const combinedPathData = $.derived(() => {
			if (dataMode()) {
				return resolvedItems().map((item) => getAbsolutePathData(item.x, item.y, item.length, item.rotate)).join('');
			}

			return null;
		});

		const initialX = initialXProp ?? (typeof x === 'number' ? x : 0);
		const initialY = initialYProp ?? (typeof y === 'number' ? y : 0);
		const initialLength = initialLengthProp ?? (typeof lengthProp === 'number' ? lengthProp : 12);
		const motionX = createMotion(initialX, () => typeof x === 'number' ? x : 0, motion);
		const motionY = createMotion(initialY, () => typeof y === 'number' ? y : 0, motion);
		const motionLength = createMotion(initialLength, () => typeof lengthProp === 'number' ? lengthProp : 12, motion);
		const pixelRotate = $.derived(() => typeof rotateProp === 'number' ? rotateProp : 0);
		const pixelPathData = $.derived(() => getAbsolutePathData(motionX.current, motionY.current, motionLength.current, pixelRotate()));

		if (children) {
			$$renderer.push('<!--[0-->');

			if (dataMode()) {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array = $.ensure_array_like(resolvedItems());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];
					const offset = getAnchorOffset(item.length);
					const resolvedClass = resolveStyleProp(className, item.d);

					$$renderer.push(`<g${$.attr('transform', `translate(${$.stringify(item.x)},${$.stringify(item.y)}) rotate(${$.stringify(item.rotate)})`)}${$.attr_class($.clsx(resolvedClass))}><g${$.attr('transform', `translate(0,${$.stringify(offset)})`)}>`);
					children($$renderer, { length: item.length, d: item.d });
					$$renderer.push(`<!----></g></g>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');

				const offset = getAnchorOffset(motionLength.current);

				$$renderer.push(`<g${$.attr('transform', `translate(${$.stringify(motionX.current)},${$.stringify(motionY.current)}) rotate(${$.stringify(pixelRotate())})`)}><g${$.attr('transform', `translate(0,${$.stringify(offset)})`)}>`);
				children($$renderer, { length: motionLength.current });
				$$renderer.push(`<!----></g></g>`);
			}

			$$renderer.push(`<!--]-->`);
		} else if (dataMode() && hasPerItemStyles()) {
			$$renderer.push(`<!--[1--><!--[-->`);

			const each_array_1 = $.ensure_array_like(resolvedItems());

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let item = each_array_1[$$index_1];
				const resolvedFill = resolveColorProp(fill, item.d, chartCtx.cScale);
				const resolvedStroke = resolveColorProp(stroke, item.d, chartCtx.cScale);
				const resolvedFillOpacity = resolveStyleProp(fillOpacity, item.d);
				const resolvedStrokeWidth = resolveStyleProp(strokeWidth, item.d);
				const resolvedOpacity = resolveStyleProp(opacity, item.d);
				const resolvedClass = resolveStyleProp(className, item.d);

				if (Path) {
					$$renderer.push('<!--[-->');

					Path($$renderer, {
						pathData: getAbsolutePathData(item.x, item.y, item.length, item.rotate),
						fill: resolvedFill,
						fillOpacity: resolvedFillOpacity,
						stroke: resolvedStroke,
						strokeWidth: resolvedStrokeWidth,
						opacity: resolvedOpacity,
						class: cls('lc-vector', isFilled() ? 'lc-vector-filled' : 'lc-vector-stroked', resolvedClass)
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (Path) {
				$$renderer.push('<!--[-->');

				Path($$renderer, {
					pathData: dataMode() ? combinedPathData() : pixelPathData(),
					fill,
					fillOpacity,
					stroke,
					strokeWidth,
					opacity,
					class: `lc-vector ${isFilled() ? 'lc-vector-filled' : 'lc-vector-stroked'} ${$.stringify(typeof className === 'string' ? className : '')}`
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]-->`);
	});
}