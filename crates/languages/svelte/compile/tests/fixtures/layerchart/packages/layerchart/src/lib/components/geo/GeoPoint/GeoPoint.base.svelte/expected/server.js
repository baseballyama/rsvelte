import * as $ from 'svelte/internal/server';
import { getLayerContext } from '$lib/contexts/layer.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function GeoPoint_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Circle,
			Group,
			lat,
			long,
			ref: refProp = void 0,
			children,
			opacity,
			fillOpacity,
			strokeWidth,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;
		const geo = getGeoContext();
		const points = $.derived(() => geo.projection?.([long, lat]) ?? [0, 0]);
		const x = $.derived(() => points()[0]);
		const y = $.derived(() => points()[1]);
		const layerCtx = getLayerContext();

		if (layerCtx === 'svg') {
			$$renderer.push('<!--[0-->');

			if (children) {
				$$renderer.push('<!--[0-->');

				if (Group) {
					$$renderer.push('<!--[-->');

					Group($$renderer, $.spread_props([
						{ x: x(), y: y(), opacity, class: className },
						extractLayerProps(restProps, 'lc-geo-point-group'),
						{
							children: ($$renderer) => {
								children($$renderer, { x: x(), y: y() });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');

				if (Circle) {
					$$renderer.push('<!--[-->');

					Circle($$renderer, $.spread_props([
						{
							cx: x(),
							cy: y(),
							opacity,
							fillOpacity,
							strokeWidth,
							class: className
						},
						extractLayerProps(restProps, 'lc-geo-point')
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
		}

		$$renderer.push(`<!--]--> `);

		if (layerCtx === 'canvas') {
			$$renderer.push('<!--[0-->');

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer, { x: x(), y: y() });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');

				if (Circle) {
					$$renderer.push('<!--[-->');

					Circle($$renderer, $.spread_props([
						{
							cx: x(),
							cy: y(),
							opacity,
							fillOpacity,
							strokeWidth,
							class: className
						},
						extractLayerProps(restProps, 'lc-geo-point')
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
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref: refProp });
	});
}