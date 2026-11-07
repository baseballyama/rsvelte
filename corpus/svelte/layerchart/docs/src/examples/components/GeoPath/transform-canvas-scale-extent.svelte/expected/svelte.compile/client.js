import 'svelte/internal/disclose-version';
import { getUsCountiesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

const geojson = await getUsCountiesTopology();
var root = $.from_html(`<!> <!>`, 1);

export default function Transform_canvas_scale_extent($$anchor, $$props) {
	$.push($$props, true);

	const states = feature(geojson, geojson.objects.states);
	const data = { geojson, states };
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			TransformContextControls(node, {});

			var node_1 = $.sibling(node, 2);

			Layer(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.each(node_2, 17, () => states.features, (feature) => feature.id, ($$anchor, feature, $$index, $$array) => {
						{
							let $0 = $.derived(() => 1 / context().transform.scale);

							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},
								class: 'stroke-surface-content fill-surface-100 hover:fill-surface-content/10',
								get strokeWidth() {
									return $.get($0);
								}
							});
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => ({ projection: geoAlbersUsa, fitGeojson: states }));

		Chart($$anchor, {
			get geo() {
				return $.get($0);
			},
			transform: { mode: 'canvas', scrollMode: 'scale', scaleExtent: [1, 8] },
			height: 400,
			clip: true,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}