import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import VectorTileSource from '$lib/VectorTileSource.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import FillLayer from '$lib/FillLayer.svelte';
import JoinedData from '$lib/JoinedData.svelte';
import { hoverStateFilter } from '$lib';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let dataSet = 0;

		function changeData() {
			if (dataSet === 0) {
				dataSet = 1;
			} else {
				dataSet = 0;
			}
		}

		$$renderer.push(`<p>This map shows how to join data to a vector tile layer on the map. The <code>JoinedData</code> component takes an array of records and joins them using the provided <code>idCol</code> to the
  source at run time. These can then be accessed in styling using the <code>['feature-state', colName]</code> syntax. <br/> This should work on PMTiles, MVT and GeoJSON sources. <br/> Ensure that you use <code>promoteId</code> to indicated which column to use to get the id of the
  feature in the source that you are trying to target, and provide a <code>sourceLayer</code> if you are
  trying to join to PMTiles or MVT tiles.</p> <button class="rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100" type="button">Change Data</button> <p>Showing data set ${$.escape(dataSet)}</p> `);

		MapLibre($$renderer, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: mapClasses,
			standardControls: true,
			center: [-87.622088, 41.778781],
			zoom: 10,
			children: ($$renderer) => {
				VectorTileSource($$renderer, {
					url: 'pmtiles://https://r2-public.protomaps.com/protomaps-sample-datasets/cb_2018_us_zcta510_500k.pmtiles',
					promoteId: 'GEOID10',
					children: ($$renderer) => {
						FillLayer($$renderer, {
							paint: {
								'fill-opacity': hoverStateFilter(0.7, 0.4),
								'fill-color': ['coalesce', ['feature-state', 'color'], '#102020']
							},
							sourceLayer: 'zcta',
							manageHoverState: true
						});

						$$renderer.push(`<!----> `);

						JoinedData($$renderer, {
							data: dataSet === 0
								? [
									{ color: '#ff0000', geoid: 60628 },
									{ color: '#00fF00', geoid: 60608 }
								]
								: [{ color: '#ff0000', geoid: 60628 }],
							idCol: 'geoid',
							sourceLayer: 'zcta'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		CodeSample($$renderer, { code });
		$$renderer.push(`<!---->`);
	});
}