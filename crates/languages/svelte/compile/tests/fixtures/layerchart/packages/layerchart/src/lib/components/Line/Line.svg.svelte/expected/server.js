import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import MarkerWrapper from '../MarkerWrapper.svelte';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createId } from '$lib/utils/createId.js';
import { LineState, lineMarkInfo } from './Line.shared.svelte.js';

export default function Line_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			// Pull out props that collide with `<line>` SVG attribute names so
			// `{...rest}` spread doesn't override our explicit values.
			x1,
			y1,
			x2,
			y2,
			marker,
			markerStart,
			markerMid,
			markerEnd,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const c = new LineState(() => ({
			x1,
			y1,
			x2,
			y2,
			marker,
			markerStart,
			markerMid,
			markerEnd,
			...rest
		}));

		const markerStartId = $.derived(() => markerStart || marker ? createId('marker-start', uid) : '');
		const markerMidId = $.derived(() => markerMid || marker ? createId('marker-mid', uid) : '');
		const markerEndId = $.derived(() => markerEnd || marker ? createId('marker-end', uid) : '');

		c.chartCtx.registerComponent({
			name: 'Line',
			kind: 'mark',
			markInfo: () => lineMarkInfo({ x1, y1, x2, y2, ...rest }, c.dataMode)
		});

		if (c.dataMode) {
			$$renderer.push('<!--[0-->');
			MarkerWrapper($$renderer, { id: markerStartId(), marker: markerStart ?? marker });
			$$renderer.push(`<!---->`);
			MarkerWrapper($$renderer, { id: markerMidId(), marker: markerMid ?? marker });
			$$renderer.push(`<!---->`);
			MarkerWrapper($$renderer, { id: markerEndId(), marker: markerEnd ?? marker });
			$$renderer.push(`<!----><!--[-->`);

			const each_array = $.ensure_array_like(c.resolvedItems);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale);
				const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale);
				const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, item.d);
				const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d);
				const resolvedOpacity = resolveStyleProp(rest.opacity, item.d);
				const resolvedClass = resolveStyleProp(rest.class, item.d);

				$$renderer.push(`<line${$.attributes(
					{
						...rest,
						x1: item.x1,
						y1: item.y1,
						x2: item.x2,
						y2: item.y2,
						fill: resolvedFill,
						stroke: resolvedStroke,
						'fill-opacity': resolvedFillOpacity,
						'stroke-width': resolvedStrokeWidth,
						opacity: resolvedOpacity,
						'marker-start': markerStartId() ? `url(#${markerStartId()})` : undefined,
						'marker-mid': markerMidId() ? `url(#${markerMidId()})` : undefined,
						'marker-end': markerEndId() ? `url(#${markerEndId()})` : undefined,
						'stroke-dasharray': c.dashArrayAttr,
						class: $.clsx(cls('lc-line', resolvedClass))
					},
					void 0,
					void 0,
					void 0,
					3
				)}></line>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><line${$.attributes(
				{
					...rest,
					x1: c.motionX1,
					y1: c.motionY1,
					x2: c.motionX2,
					y2: c.motionY2,
					fill: c.staticFill,
					stroke: c.staticStroke,
					'fill-opacity': c.staticFillOpacity,
					'stroke-width': c.staticStrokeWidth,
					opacity: c.staticOpacity,
					'marker-start': markerStartId() ? `url(#${markerStartId()})` : undefined,
					'marker-mid': markerMidId() ? `url(#${markerMidId()})` : undefined,
					'marker-end': markerEndId() ? `url(#${markerEndId()})` : undefined,
					'stroke-dasharray': c.dashArrayAttr,
					class: $.clsx(cls('lc-line', c.staticClassName))
				},
				void 0,
				void 0,
				void 0,
				3
			)}></line>`);

			MarkerWrapper($$renderer, { id: markerStartId(), marker: markerStart ?? marker });
			$$renderer.push(`<!---->`);
			MarkerWrapper($$renderer, { id: markerMidId(), marker: markerMid ?? marker });
			$$renderer.push(`<!---->`);
			MarkerWrapper($$renderer, { id: markerEndId(), marker: markerEnd ?? marker });
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}