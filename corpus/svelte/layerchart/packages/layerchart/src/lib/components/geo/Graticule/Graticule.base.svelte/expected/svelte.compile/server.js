import * as $ from 'svelte/internal/server';
import { geoGraticule } from 'd3-geo';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function Graticule_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Group,
			GeoPath,
			lines,
			outline,
			stepX = 10,
			stepY = 10,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const graticule = $.derived(() => geoGraticule().step([stepX, stepY]));

		if (Group) {
			$$renderer.push('<!--[-->');

			Group($$renderer, {
				class: 'lc-graticule-g',
				children: ($$renderer) => {
					if (!lines && !outline) {
						$$renderer.push('<!--[0-->');

						if (GeoPath) {
							$$renderer.push('<!--[-->');

							GeoPath($$renderer, $.spread_props([
								{ geojson: graticule()() },
								extractLayerProps(restProps, 'lc-graticule-geo-path')
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

					if (lines) {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array = $.ensure_array_like(graticule().lines());

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let line = each_array[$$index];

							if (GeoPath) {
								$$renderer.push('<!--[-->');

								GeoPath($$renderer, $.spread_props([
									{ geojson: line },
									extractLayerProps(lines, 'lc-graticule-geo-line')
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

					if (outline) {
						$$renderer.push('<!--[0-->');

						if (GeoPath) {
							$$renderer.push('<!--[-->');

							GeoPath($$renderer, $.spread_props([
								{ geojson: graticule().outline() },
								extractLayerProps(outline, 'lc-graticule-geo-outline')
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}