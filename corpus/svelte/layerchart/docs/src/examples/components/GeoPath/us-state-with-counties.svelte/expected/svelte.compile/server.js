import * as $ from 'svelte/internal/server';
import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Tooltip } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import GeopathControls from '$lib/components/controls/GeoPathStatesControls.svelte';
import { sort } from '@layerstack/utils';
import { getUsCountiesTopology } from '$lib/geo.remote.js';

const topology = await getUsCountiesTopology();

export default function Us_state_with_counties($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const counties = feature(topology, topology.objects.counties);
		const states = feature(topology, topology.objects.states);
		const stateOptions = sort(states.features.filter((x) => Number(x.id) < 60).map((x) => ({ label: x.properties.name, value: x.id })), (d) => d.value);
		let selectedStateId = '54'; // 'West Virginia';
		const selectedStateFeature = $.derived(() => states.features.find((f) => f.id === selectedStateId));
		const selectedCountiesFeatures = $.derived(() => counties.features.filter((f) => String(f.id).slice(0, 2) === selectedStateId));
		let projection = geoAlbersUsa;

		const projections = [
			{ label: 'Albers', value: geoAlbers },
			{ label: 'Albers USA', value: geoAlbersUsa },
			{ label: 'Mercator', value: geoMercator }
		];

		const data = {
			topology,
			counties,
			states,
			selectedStateFeature: selectedStateFeature(),
			selectedCountiesFeatures: selectedCountiesFeatures()
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

			{
				function children($$renderer, { context }) {
					Layer($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(selectedCountiesFeatures());

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let feature = each_array[$$index];

								GeoPath($$renderer, {
									geojson: feature,
									class: 'fill-surface-100 stroke-surface-content/10 hover:fill-surface-content/20',
									tooltip: true
								});
							}

							$$renderer.push(`<!--]--> `);

							GeoPath($$renderer, {
								geojson: selectedStateFeature(),
								class: 'fill-none stroke-surface-content pointer-events-none'
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(context.tooltip.data?.properties.name)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				Chart($$renderer, {
					geo: { projection, fitGeojson: selectedStateFeature() },
					height: 600,
					children,
					$$slots: { default: true }
				});
			}

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