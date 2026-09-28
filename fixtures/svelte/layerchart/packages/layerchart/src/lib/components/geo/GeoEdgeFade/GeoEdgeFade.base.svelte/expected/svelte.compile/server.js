import * as $ from 'svelte/internal/server';
import { scaleLinear } from 'd3-scale';
import { geoDistance } from 'd3-geo';
import { getGeoContext } from '$lib/contexts/geo.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function GeoEdgeFade_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Group,
			link,
			ref: refProp = void 0,
			children,
			opacity: opacityProp,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;
		const geo = getGeoContext();
		const fade = scaleLinear().domain([-0.1, 0]).range([0, 0.1]);
		const clamper = scaleLinear().domain([0, 1]).range([0, 1]).clamp(true);
		const center = $.derived(() => geo.projection?.invert?.(geo.projection?.translate()) ?? [0, 0]);
		const source = $.derived(() => link.source);
		const target = $.derived(() => link.target);
		const startDistance = $.derived(() => 1.57 - geoDistance(source(), center()));
		const endDistance = $.derived(() => 1.57 - geoDistance(target(), center()));
		const distance = $.derived(() => startDistance() < endDistance() ? startDistance() : endDistance());
		const opacity = $.derived(() => opacityProp ?? clamper(fade(distance())));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Group) {
				$$renderer.push('<!--[-->');

				Group($$renderer, $.spread_props([
					{ opacity: opacity() },
					extractLayerProps(restProps, 'lc-geo-edge-fade'),
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							children?.($$renderer);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref: refProp });
	});
}