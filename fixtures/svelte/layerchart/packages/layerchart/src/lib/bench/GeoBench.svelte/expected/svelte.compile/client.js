import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '../components/Chart/Chart.svelte';
import Layer from '../components/layers/Layer.svelte';
import GeoPath from '../components/geo/GeoPath/GeoPath.svelte';

export default function GeoBench($$anchor, $$props) {
	let layer = $.prop($$props, 'layer', 3, 'svg'),
		height = $.prop($$props, 'height', 3, 400);

	{
		let $0 = $.derived(() => ({
			projection: $$props.projection,
			fitGeojson: $$props.fitGeojson
		}));

		Chart($$anchor, {
			get geo() {
				return $.get($0);
			},

			get width() {
				return $$props.width;
			},

			get height() {
				return height();
			},

			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					get type() {
						return layer();
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node = $.first_child(fragment_2);

						$.each(node, 17, () => $$props.features, $.index, ($$anchor, feature) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},
								class: 'fill-surface-content/10 stroke-surface-content/20'
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}
}