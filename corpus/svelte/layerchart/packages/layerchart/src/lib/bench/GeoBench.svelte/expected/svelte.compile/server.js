import * as $ from 'svelte/internal/server';
import Chart from '../components/Chart/Chart.svelte';
import Layer from '../components/layers/Layer.svelte';
import GeoPath from '../components/geo/GeoPath/GeoPath.svelte';

export default function GeoBench($$renderer, $$props) {
	let {
		features,
		fitGeojson,
		projection,
		layer = 'svg',
		height = 400,
		width
	} = $$props;

	Chart($$renderer, {
		geo: { projection, fitGeojson },
		width,
		height,
		children: ($$renderer) => {
			Layer($$renderer, {
				type: layer,
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(features);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let feature = each_array[i];

						GeoPath($$renderer, {
							geojson: feature,
							class: 'fill-surface-content/10 stroke-surface-content/20'
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}