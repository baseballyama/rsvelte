import * as $ from 'svelte/internal/server';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { getPixelValue, TextState, textMarkInfo } from './Text.shared.svelte.js';

export default function Text_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...rest } = $$props;
		const c = new TextState(() => rest);

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
				const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, item.d);
				const resolvedOpacity = resolveStyleProp(rest.opacity, item.d);
				const resolvedClass = resolveStyleProp(rest.class, item.d);
				const textAnchor = rest.textAnchor ?? 'start';
				const verticalAnchor = rest.verticalAnchor ?? 'end';
				const translateX = textAnchor === 'middle' ? '-50%' : textAnchor === 'end' ? '-100%' : '0%';
				const translateY = verticalAnchor === 'middle' ? '-50%' : verticalAnchor === 'end' ? '-100%' : '0%';

				$$renderer.push(`<div${$.attr_class($.clsx(['lc-text', resolvedClass]))}${$.attr_style('', {
					position: 'absolute',
					left: `${$.stringify(getPixelValue(rest.dx ?? 0) + item.x)}px`,
					top: `${$.stringify(getPixelValue(rest.dy ?? 0) + item.y)}px`,
					transform: `translate(${translateX}, ${translateY}) rotate(${$.stringify(rest.rotate ?? 0)}deg)`,
					'transform-origin': `${verticalAnchor === 'middle'
						? 'center'
						: verticalAnchor === 'end' ? 'bottom' : 'top'} ${textAnchor === 'middle' ? 'center' : textAnchor === 'end' ? 'right' : 'left'}`,
					'white-space': 'pre-wrap',
					'line-height': rest.lineHeight ?? '1em',
					'font-size': typeof rest.fontSize === 'number' ? `${rest.fontSize}px` : rest.fontSize,
					color: resolvedFill,
					opacity: resolvedOpacity ?? resolvedFillOpacity
				})}>${$.escape(text)}</div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			const textAnchor = rest.textAnchor ?? 'start';
			const verticalAnchor = rest.verticalAnchor ?? 'end';
			const translateX = textAnchor === 'middle' ? '-50%' : textAnchor === 'end' ? '-100%' : '0%';
			const translateY = verticalAnchor === 'middle' ? '-50%' : verticalAnchor === 'end' ? '-100%' : '0%';

			$$renderer.push(`<div${$.attr_class($.clsx(['lc-text', c.staticClassName]))}${$.attr_style('', {
				position: 'absolute',
				left: `${$.stringify((typeof rest.dx === 'number' ? rest.dx : 0) + (typeof c.motionX === 'number' ? c.motionX : 0))}px`,
				top: `${$.stringify((typeof rest.dy === 'number' ? rest.dy : 0) + (typeof c.motionY === 'number' ? c.motionY : 0))}px`,
				transform: `translate(${translateX}, ${translateY}) rotate(${$.stringify(rest.rotate ?? 0)}deg)`,
				'transform-origin': `${verticalAnchor === 'middle'
					? 'center'
					: verticalAnchor === 'end' ? 'bottom' : 'top'} ${textAnchor === 'middle' ? 'center' : textAnchor === 'end' ? 'right' : 'left'}`,
				'white-space': 'pre-wrap',
				'line-height': rest.lineHeight ?? '1em',
				'font-size': typeof rest.fontSize === 'number' ? `${rest.fontSize}px` : rest.fontSize,
				color: c.staticFill,
				opacity: c.staticOpacity ?? c.staticFillOpacity
			})}>`);

			if (rest.segments) {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array_1 = $.ensure_array_like(rest.segments);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let segment = each_array_1[$$index_1];

					$$renderer.push(`<span${$.attr_class($.clsx(segment.class))}>${$.escape(segment.value)}</span>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(c.textValue)}`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}