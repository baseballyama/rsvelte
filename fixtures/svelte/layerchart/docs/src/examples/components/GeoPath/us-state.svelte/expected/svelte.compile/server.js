import * as $ from 'svelte/internal/server';
import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import GeopathControls from '$lib/components/controls/GeoPathStatesControls.svelte';
import { sort } from '@layerstack/utils';
import { getUsCountiesTopology } from '$lib/geo.remote.js';

const topology = await getUsCountiesTopology();

export default function Us_state($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const states = feature(topology, topology.objects.states);
		const stateOptions = sort(states.features.filter((x) => Number(x.id) < 60).map((x) => ({ label: x.properties.name, value: x.id })), (d) => d.value);
		let selectedStateId = '54'; // 'West Virginia';
		const selectedStateFeature = $.derived(() => states.features.find((f) => f.id === selectedStateId));
		let projection = geoAlbersUsa;

		const projections = [
			{ label: 'Albers', value: geoAlbers },
			{ label: 'Albers USA', value: geoAlbersUsa },
			{ label: 'Mercator', value: geoMercator }
		];

		const data = {
			topology,
			states,
			selectedStateFeature: selectedStateFeature()
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			GeopathControls($$renderer, {
				stateOptions,
				projections,
				get selectedStateId() {
					return selectedStateId;
				},

				set selectedStateId($$value) {
					selectedStateId = $$value;
					$$settled = false;
				},

				get projection() {
					return projection;
				},

				set projection($$value) {
					projection = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				geo: { projection, fitGeojson: selectedStateFeature() },
				height: 600,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							GeoPath($$renderer, {
								geojson: selectedStateFeature(),
								class: 'stroke-surface-content'
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}