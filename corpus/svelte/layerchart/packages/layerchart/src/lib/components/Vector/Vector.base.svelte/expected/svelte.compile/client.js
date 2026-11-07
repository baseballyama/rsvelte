import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Path',
	'x',
	'initialX',
	'y',
	'initialY',
	'length',
	'initialLength',
	'rotate',
	'shape',
	'anchor',
	'width',
	'children',
	'data',
	'key',
	'motion',
	'fill',
	'fillOpacity',
	'stroke',
	'strokeWidth',
	'opacity',
	'class'
]);

var root = $.from_svg(`<g><g><!></g></g>`);

export default function Vector_base($$anchor, $$props) {
	$.push($$props, true);

	let x = $.prop($$props, 'x', 3, 0),
		y = $.prop($$props, 'y', 3, 0),
		lengthProp = $.prop($$props, 'length', 3, 12),
		rotateProp = $.prop($$props, 'rotate', 3, 0),
		shape = $.prop($$props, 'shape', 3, 'arrow'),
		keyFn = $.prop($$props, 'key', 3, (_, i) => i),
		restProps = $.rest_props($$props, rest_excludes);

	const isFilled = $.derived(() => shape() === 'spike' || shape() === 'arrow-filled');
	const resolvedAnchor = $.derived(() => $$props.anchor ?? ($.get(isFilled) ? 'start' : 'middle'));
	const dataMode = $.derived(() => hasAnyDataProp(x(), y(), lengthProp(), rotateProp()));
	const hasPerItemStyles = $.derived(() => typeof $$props.fill === 'function' || typeof $$props.stroke === 'function' || typeof $$props.fillOpacity === 'function' || typeof $$props.strokeWidth === 'function' || typeof $$props.opacity === 'function' || typeof $$props.class === 'function');
	const chartCtx = getChartContext();
	const geo = getGeoContext();
	const resolvedData = $.derived(() => $.get(dataMode) ? $$props.data ?? chartDataArray(chartCtx.data) : []);

	function resolveVector(d) {
		let resolvedX, resolvedY;

		if (geo.projection) {
			[resolvedX, resolvedY] = resolveGeoDataPair(x(), y(), d, geo.projection);
		} else {
			resolvedX = resolveDataProp(x(), d, chartCtx.xScale, 0);
			resolvedY = resolveDataProp(y(), d, chartCtx.yScale, 0);
		}

		return {
			x: resolvedX,
			y: resolvedY,
			length: resolveDataProp(lengthProp(), d, chartCtx.rScale, typeof lengthProp() === 'number' ? lengthProp() : 12),
			rotate: typeof rotateProp() === 'number'
				? rotateProp()
				: extractRawDataValue(rotateProp(), d) ?? 0
		};
	}

	const dataMotionMap = createDataMotionMap($$props.motion);

	if (dataMotionMap) {
		$.user_effect(() => {
			if (!$.get(dataMode)) return;

			const activeKeys = new Set();

			for (let i = 0; i < $.get(resolvedData).length; i++) {
				const d = $.get(resolvedData)[i];
				const key = keyFn()(d, i);

				activeKeys.add(key);

				const resolved = resolveVector(d);

				untrack(() => dataMotionMap.update(key, resolved));
			}

			untrack(() => dataMotionMap.cleanup(activeKeys));
		});
	}

	const resolvedItems = $.derived(() => {
		if (!$.get(dataMode)) return [];

		return $.get(resolvedData).map((d, i) => {
			const key = keyFn()(d, i);
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
		switch ($.get(resolvedAnchor)) {
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
		const w = $$props.width ?? len * 0.25;

		if (shape() === 'spike') {
			return vectorSpikePath({ length: len, anchor: $.get(resolvedAnchor), width: w });
		}

		if (shape() === 'arrow-filled') {
			return vectorArrowFilledPath({ length: len, anchor: $.get(resolvedAnchor), width: w });
		}

		return vectorArrowPath({ length: len, anchor: $.get(resolvedAnchor), width: w });
	}

	function getAbsolutePathData(itemX, itemY, len, rot) {
		return transformVectorPath(getLocalPathData(len), itemX, itemY, rot);
	}

	const combinedPathData = $.derived(() => {
		if ($.get(dataMode)) {
			return $.get(resolvedItems).map((item) => getAbsolutePathData(item.x, item.y, item.length, item.rotate)).join('');
		}

		return null;
	});

	const initialX = $$props.initialX ?? (typeof x() === 'number' ? x() : 0);
	const initialY = $$props.initialY ?? (typeof y() === 'number' ? y() : 0);
	const initialLength = $$props.initialLength ?? (typeof lengthProp() === 'number' ? lengthProp() : 12);
	const motionX = createMotion(initialX, () => typeof x() === 'number' ? x() : 0, $$props.motion);
	const motionY = createMotion(initialY, () => typeof y() === 'number' ? y() : 0, $$props.motion);
	const motionLength = createMotion(initialLength, () => typeof lengthProp() === 'number' ? lengthProp() : 12, $$props.motion);
	const pixelRotate = $.derived(() => typeof rotateProp() === 'number' ? rotateProp() : 0);
	const pixelPathData = $.derived(() => getAbsolutePathData(motionX.current, motionY.current, motionLength.current, $.get(pixelRotate)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.each(node_2, 17, () => $.get(resolvedItems), (item) => item.key, ($$anchor, item) => {
						const offset = $.derived(() => getAnchorOffset($.get(item).length));
						const resolvedClass = $.derived(() => resolveStyleProp($$props.class, $.get(item).d));
						var g = root();
						var g_1 = $.child(g);
						var node_3 = $.child(g_1);

						$.snippet(node_3, () => $$props.children, () => ({ length: $.get(item).length, d: $.get(item).d }));
						$.reset(g_1);
						$.reset(g);

						$.template_effect(() => {
							$.set_attribute(g, 'transform', `translate(${$.get(item).x ?? ''},${$.get(item).y ?? ''}) rotate(${$.get(item).rotate ?? ''})`);
							$.set_class(g, 0, $.clsx($.get(resolvedClass)));
							$.set_attribute(g_1, 'transform', `translate(0,${$.get(offset) ?? ''})`);
						});

						$.append($$anchor, g);
					});

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					const offset = $.derived(() => getAnchorOffset(motionLength.current));
					var g_2 = root();
					var g_3 = $.child(g_2);
					var node_4 = $.child(g_3);

					$.snippet(node_4, () => $$props.children, () => ({ length: motionLength.current }));
					$.reset(g_3);
					$.reset(g_2);

					$.template_effect(() => {
						$.set_attribute(g_2, 'transform', `translate(${motionX.current ?? ''},${motionY.current ?? ''}) rotate(${$.get(pixelRotate) ?? ''})`);
						$.set_attribute(g_3, 'transform', `translate(0,${$.get(offset) ?? ''})`);
					});

					$.append($$anchor, g_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(dataMode)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var consequent_2 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_5 = $.first_child(fragment_3);

			$.each(node_5, 17, () => $.get(resolvedItems), (item) => item.key, ($$anchor, item) => {
				const resolvedFill = $.derived(() => resolveColorProp($$props.fill, $.get(item).d, chartCtx.cScale));
				const resolvedStroke = $.derived(() => resolveColorProp($$props.stroke, $.get(item).d, chartCtx.cScale));
				const resolvedFillOpacity = $.derived(() => resolveStyleProp($$props.fillOpacity, $.get(item).d));
				const resolvedStrokeWidth = $.derived(() => resolveStyleProp($$props.strokeWidth, $.get(item).d));
				const resolvedOpacity = $.derived(() => resolveStyleProp($$props.opacity, $.get(item).d));
				const resolvedClass = $.derived(() => resolveStyleProp($$props.class, $.get(item).d));
				var fragment_4 = $.comment();
				var node_6 = $.first_child(fragment_4);

				{
					let $0 = $.derived(() => getAbsolutePathData($.get(item).x, $.get(item).y, $.get(item).length, $.get(item).rotate));
					let $1 = $.derived(() => cls('lc-vector', $.get(isFilled) ? 'lc-vector-filled' : 'lc-vector-stroked', $.get(resolvedClass)));

					$.component(node_6, () => $$props.Path, ($$anchor, Path_1) => {
						Path_1($$anchor, {
							get pathData() {
								return $.get($0);
							},

							get fill() {
								return $.get(resolvedFill);
							},

							get fillOpacity() {
								return $.get(resolvedFillOpacity);
							},

							get stroke() {
								return $.get(resolvedStroke);
							},

							get strokeWidth() {
								return $.get(resolvedStrokeWidth);
							},

							get opacity() {
								return $.get(resolvedOpacity);
							},

							get class() {
								return $.get($1);
							}
						});
					});
				}

				$.append($$anchor, fragment_4);
			});

			$.append($$anchor, fragment_3);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_7 = $.first_child(fragment_5);

			{
				let $0 = $.derived(() => $.get(dataMode) ? $.get(combinedPathData) : $.get(pixelPathData));
				let $1 = $.derived(() => $.get(isFilled) ? 'lc-vector-filled' : 'lc-vector-stroked');
				let $2 = $.derived(() => typeof $$props.class === 'string' ? $$props.class : '');

				$.component(node_7, () => $$props.Path, ($$anchor, Path_2) => {
					Path_2($$anchor, {
						get pathData() {
							return $.get($0);
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

						get class() {
							return `lc-vector ${$.get($1) ?? ''} ${$.get($2) ?? ''}`;
						}
					});
				});
			}

			$.append($$anchor, fragment_5);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent_1); else if ($.get(dataMode) && $.get(hasPerItemStyles)) $$render(consequent_2, 1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}