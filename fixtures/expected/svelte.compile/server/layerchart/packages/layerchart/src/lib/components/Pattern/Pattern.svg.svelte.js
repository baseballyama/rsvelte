import * as $ from 'svelte/internal/server';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { createId } from '$lib/utils/createId.js';
import { buildPatternShapes } from './Pattern.shared.svelte.js';

export default function Pattern_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId('pattern-', uid),
			size = 4,
			width = size,
			height = size,
			lines: linesProp,
			circles: circlesProp,
			rects: rectsProp,
			background,
			patternContent,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const shapes = $.derived(() => buildPatternShapes(linesProp, circlesProp, size, width, height, rectsProp));

		$$renderer.push(`<defs><pattern${$.attributes(
			{
				id,
				width,
				height,
				patternUnits: 'userSpaceOnUse',
				...extractLayerProps(rest, 'lc-pattern')
			},
			void 0,
			void 0,
			void 0,
			3
		)}>`);

		if (patternContent) {
			$$renderer.push('<!--[0-->');
			patternContent?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (background) {
				$$renderer.push(`<!--[0--><rect${$.attr('width', width)}${$.attr('height', height)}${$.attr('fill', background)}></rect>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--><!--[-->`);

			const each_array = $.ensure_array_like(shapes().filter((s) => s.type === 'line'));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let line = each_array[$$index];

				$$renderer.push(`<path${$.attr('d', line.path)}${$.attr('stroke', line.stroke)}${$.attr('stroke-width', line.strokeWidth)} fill="none"${$.attr('opacity', line.opacity)}></path>`);
			}

			$$renderer.push(`<!--]--><!--[-->`);

			const each_array_1 = $.ensure_array_like(shapes().filter((s) => s.type === 'circle'));

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let circle = each_array_1[$$index_1];

				$$renderer.push(`<circle${$.attr('cx', circle.cx)}${$.attr('cy', circle.cy)}${$.attr('r', circle.r)}${$.attr('fill', circle.fill)}${$.attr('opacity', circle.opacity)}></circle>`);
			}

			$$renderer.push(`<!--]--><!--[-->`);

			const each_array_2 = $.ensure_array_like(shapes().filter((s) => s.type === 'rect'));

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let rect = each_array_2[$$index_2];

				$$renderer.push(`<rect${$.attr('x', rect.x)}${$.attr('y', rect.y)}${$.attr('width', rect.width)}${$.attr('height', rect.height)}${$.attr('rx', rect.rx)}${$.attr('ry', rect.ry)}${$.attr('fill', rect.fill)}${$.attr('opacity', rect.opacity)}></rect>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></pattern></defs>`);
		children?.($$renderer, { id, pattern: `url(#${id})` });
		$$renderer.push(`<!---->`);
	});
}