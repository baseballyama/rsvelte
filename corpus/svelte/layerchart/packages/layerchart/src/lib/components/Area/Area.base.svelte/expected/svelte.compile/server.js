import * as $ from 'svelte/internal/server';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { AreaState } from './Area.shared.svelte.js';

export default function Area_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Path,
			Spline,
			curve,
			data,
			defined,
			fill,
			stroke = 'none',
			opacity,
			// Pulled out of `restProps` so the resolved values win over the raw props
			class: className,
			line = false,
			pathData,
			motion,
			x,
			y0,
			y1,
			z,
			seriesKey,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const c = new AreaState(() => ({
			curve,
			data,
			defined,
			fill,
			stroke,
			opacity,
			class: className,
			line,
			pathData,
			motion,
			x,
			y0,
			y1,
			z,
			seriesKey
		}));

		if (c.areas) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(c.areas);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let area = each_array[i];

				if (line) {
					$$renderer.push('<!--[0-->');

					if (Spline) {
						$$renderer.push('<!--[-->');

						Spline($$renderer, $.spread_props([
							{
								data: area.data,
								x,
								y: c.lineYAccessor,
								seriesKey,
								curve,
								defined,
								stroke: area.fill
							},
							extractLayerProps(line, 'lc-area-line')
						]));

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (Path) {
					$$renderer.push('<!--[-->');

					Path($$renderer, $.spread_props([
						{
							pathData: area.d,
							fill: area.fill,
							stroke: area.stroke,
							opacity: area.opacity ?? c.pathOpacity
						},
						extractLayerProps(restProps, 'lc-area-path', area.class ?? '')
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

			if (line) {
				$$renderer.push('<!--[0-->');

				if (Spline) {
					$$renderer.push('<!--[-->');

					Spline($$renderer, $.spread_props([
						{
							data: data ?? c.seriesData,
							x,
							y: c.lineYAccessor,
							seriesKey,
							curve,
							defined,
							motion
						},
						extractLayerProps(line, 'lc-area-line')
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (Path) {
				$$renderer.push('<!--[-->');

				Path($$renderer, $.spread_props([
					{
						pathData: c.tweenedPath,
						fill: c.resolvedFill,
						stroke: c.resolvedStroke,
						opacity: c.resolvedOpacity ?? c.pathOpacity
					},
					extractLayerProps(restProps, 'lc-area-path', c.resolvedClass ?? '')
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