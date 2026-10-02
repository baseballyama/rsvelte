import * as $ from 'svelte/internal/server';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createId } from '$lib/utils/createId.js';
import { TextState, textMarkInfo, getPixelValue } from './Text.shared.svelte.js';

export default function Text_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			svgRef: svgRefProp = void 0,
			ref: refProp = void 0,
			pathId = createId('text-path', uid),
			// Pull out props that collide with SVG `<text>`/`<svg>` attribute names
			// — we use these internally for layout and transforms, not as raw DOM
			// attrs. Without this, `{...rest}` spread would set
			// `<text rotate="..." dx="..." dy="...">` (which SVG interprets per
			// glyph, not on the whole text).
			rotate,
			dx,
			dy,
			// `fontSize` is a typed prop (drives `capHeight` defaults), but on the
			// DOM it must be rendered as the kebab-case `font-size` attribute.
			fontSize,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const c = new TextState(() => ({ rotate, dx, dy, fontSize, ...rest }));
		let ref = void 0;
		let svgRef = void 0;

		c.chartCtx.registerComponent({
			name: 'Text',
			kind: 'mark',
			markInfo: () => textMarkInfo(rest, c.dataMode)
		});

		if (c.dataMode) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(c.resolvedItems);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				const text = c.resolveTextValue(item.d);
				const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale);
				const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale);
				const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, item.d);
				const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d);
				const resolvedOpacity = resolveStyleProp(rest.opacity, item.d);
				const resolvedClass = resolveStyleProp(rest.class, item.d);
				const dataRotateTransform = rotate ? `rotate(${rotate}, ${item.x}, ${item.y})` : '';

				$$renderer.push(`<svg${$.attributes(
					{
						x: dx ?? 0,
						y: dy ?? 0,
						...rest.svgProps,
						class: $.clsx(['lc-text-svg', rest.svgProps?.class])
					},
					void 0,
					void 0,
					void 0,
					3
				)}><text${$.attributes(
					{
						...rest,
						x: item.x,
						y: item.y,
						transform: rest.transform ?? dataRotateTransform,
						'text-anchor': rest.textAnchor ?? 'start',
						'dominant-baseline': rest.dominantBaseline ?? 'auto',
						'font-size': fontSize,
						fill: resolvedFill,
						'fill-opacity': resolvedFillOpacity,
						stroke: resolvedStroke,
						'stroke-width': resolvedStrokeWidth,
						opacity: resolvedOpacity,
						class: $.clsx(['lc-text', resolvedClass])
					},
					void 0,
					void 0,
					void 0,
					3
				)}><tspan${$.attr('x', item.x)}${$.attr('dy', c.dataModeStartDy)} class="lc-text-tspan">${$.escape(text)}</tspan></text></svg>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><svg${$.attributes(
				{
					x: dx ?? 0,
					y: dy ?? 0,
					...rest.svgProps,
					class: $.clsx(['lc-text-svg', rest.svgProps?.class])
				},
				void 0,
				void 0,
				void 0,
				3
			)}>`);

			if (rest.path) {
				$$renderer.push(`<!--[0--><defs><!---->`);

				{
					$$renderer.push(`<path${$.attr('id', pathId)}${$.attr('d', rest.path)}></path>`);
				}

				$$renderer.push(`<!----></defs><text${$.attributes(
					{
						...rest,
						dy: dy ?? 0,
						'font-size': fontSize,
						fill: c.staticFill,
						'fill-opacity': c.staticFillOpacity,
						stroke: c.staticStroke,
						'stroke-width': c.staticStrokeWidth,
						opacity: c.staticOpacity,
						transform: rest.transform,
						class: $.clsx(['lc-text', c.staticClassName])
					},
					void 0,
					void 0,
					void 0,
					3
				)}><textPath${$.attr_style(`text-anchor: ${$.stringify(rest.textAnchor ?? 'start')};`)}${$.attr('dominant-baseline', rest.dominantBaseline ?? 'auto')}${$.attr('href', `#${$.stringify(pathId)}`)}${$.attr('startOffset', rest.startOffset ?? '0%')} class="lc-text-path">${$.escape(c.wordsByLines.map((line) => line.words.join(' ')).join())}</textPath></text>`);
			} else {
				$$renderer.push(`<!--[-1--><text${$.attributes(
					{
						...rest,
						x: c.motionX,
						y: c.motionY,
						transform: c.transform,
						'text-anchor': rest.textAnchor ?? 'start',
						'dominant-baseline': rest.dominantBaseline ?? 'auto',
						'font-size': fontSize,
						fill: c.staticFill,
						'fill-opacity': c.staticFillOpacity,
						stroke: c.staticStroke,
						'stroke-width': c.staticStrokeWidth,
						opacity: c.staticOpacity,
						class: $.clsx(['lc-text', c.staticClassName])
					},
					void 0,
					void 0,
					void 0,
					3
				)}>`);

				if (rest.segments) {
					$$renderer.push(`<!--[0--><!--[-->`);

					const each_array_1 = $.ensure_array_like(rest.segments);

					for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
						let segment = each_array_1[index];

						$$renderer.push(`<tspan${$.attr('dy', index === 0 ? c.startDy : 0)}${$.attr_class($.clsx(['lc-text-tspan', segment.class]))}>${$.escape(segment.value)}</tspan>`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push(`<!--[-1--><!--[-->`);

					const each_array_2 = $.ensure_array_like(c.wordsByLines);

					for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
						let line = each_array_2[index];

						$$renderer.push(`<tspan${$.attr('x', c.motionX)}${$.attr('dy', index === 0 ? c.startDy : getPixelValue(rest.lineHeight ?? '1em'))} class="lc-text-tspan">${$.escape(line.words.join(' '))}</tspan>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></text>`);
			}

			$$renderer.push(`<!--]--></svg>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { svgRef: svgRefProp, ref: refProp });
	});
}