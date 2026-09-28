import * as $ from 'svelte/internal/server';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import { getUsCountiesTopology } from '$lib/geo.remote.js';

const geojson = await getUsCountiesTopology();

export default function Transform_canvas_scale_extent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const states = feature(geojson, geojson.objects.states);
		const data = { geojson, states };

		{
			function children($$renderer, { context }) {
				TransformContextControls($$renderer, {});
				$$renderer.push(`<!----> `);

				Layer($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(states.features);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let feature = each_array[$$index];

							GeoPath($$renderer, {
								geojson: feature,
								class: 'stroke-surface-content fill-surface-100 hover:fill-surface-content/10',
								strokeWidth: 1 / context.transform.scale
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			Chart($$renderer, {
				geo: { projection: geoAlbersUsa, fitGeojson: states },
				transform: { mode: 'canvas', scrollMode: 'scale', scaleExtent: [1, 8] },
				height: 400,
				clip: true,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}