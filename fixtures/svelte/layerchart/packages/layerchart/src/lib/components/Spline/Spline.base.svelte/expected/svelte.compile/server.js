import * as $ from 'svelte/internal/server';
import { SplineState } from './Spline.shared.svelte.js';

export default function Spline_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Path,
			data,
			x,
			y,
			z,
			seriesKey,
			defined,
			curve,
			stroke,
			fill,
			opacity,
			// Pulled out of `restProps` so a function-valued `class` isn't spread onto the element
			class: className,
			motion,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const c = new SplineState(() => ({
			data,
			x,
			y,
			z,
			seriesKey,
			defined,
			curve,
			stroke,
			fill,
			opacity,
			class: className,
			motion
		}));

		if (c.segments) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(c.segments);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let seg = each_array[i];

				if (Path) {
					$$renderer.push('<!--[-->');

					Path($$renderer, $.spread_props([
						{
							pathData: seg.d,
							stroke: seg.stroke,
							fill: seg.fill,
							opacity: seg.opacity ?? (c.seriesOpacity === 1 ? undefined : c.seriesOpacity),
							class: seg.class
						},
						c.series?.props,
						restProps
					]));

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

				Path($$renderer, $.spread_props([
					{
						pathData: c.isTweened ? c.tweenedPath : c.d,
						stroke: c.resolvedStroke,
						fill: c.resolvedFill,
						opacity: (typeof opacity === 'number' ? opacity : undefined) ?? (c.seriesOpacity === 1 ? undefined : c.seriesOpacity),
						class: c.resolvedClass
					},
					c.series?.props,
					restProps
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]-->`);
	});
}