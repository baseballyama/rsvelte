import * as $ from 'svelte/internal/server';
import { index } from 'd3-array';
import { geoIdentity, geoPath as d3GeoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Vector, Tooltip } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import { getUsCountiesAlbersTopology, getUsPresidentialElection2020 } from '$lib/geo.remote.js';

const topology = await getUsCountiesAlbersTopology();
const electionData = await getUsPresidentialElection2020();

export default function Election_wind_map($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const projection = geoIdentity;
		const states = feature(topology, topology.objects.states);
		const counties = feature(topology, topology.objects.counties);

		// Index election data by FIPS code
		const electionByFips = index(electionData, (d) => String(d.county_fips).padStart(5, '0'));

		// Index county features by FIPS for hover highlight
		const countyFeatureByFips = index(counties.features, (d) => String(d.id).padStart(5, '0'));

		// Compute raw centroids
		const geoPathGenerator = d3GeoPath(geoIdentity());

		const vectorData = counties.features.map((feat) => {
			const fips = String(feat.id).padStart(5, '0');
			const election = electionByFips.get(fips);

			if (!election) return null;

			const centroid = geoPathGenerator.centroid(feat);

			if (!isFinite(centroid[0]) || !isFinite(centroid[1])) return null;

			const demWon = election.votes_dem > election.votes_gop;

			return {
				fips,
				cx: centroid[0],
				cy: centroid[1],
				voteDiff: Math.abs(election.diff),
				party: demWon ? 'dem' : 'gop',
				county_name: election.county_name,
				state_name: election.state_name,
				votes_dem: election.votes_dem,
				votes_gop: election.votes_gop,
				total_votes: election.total_votes
			};
		}).filter(Boolean);

		const data = { topology, electionData };

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						GeoPath($$renderer, {
							geojson: states,
							class: 'fill-surface-content/10 stroke-surface-100'
						});

						$$renderer.push(`<!----> `);

						Vector($$renderer, {
							x: 'cx',
							y: 'cy',
							length: 'voteDiff',
							rotate: (d) => d.party === 'dem' ? -60 : 60,
							shape: 'arrow-filled',
							anchor: 'start',
							data: vectorData,
							class: (d) => d.party === 'dem' ? 'fill-blue-500' : 'fill-red-500'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Layer($$renderer, {
					pointerEvents: false,
					children: ($$renderer) => {
						if (context.tooltip.data) {
							$$renderer.push('<!--[0-->');

							const countyFeature = countyFeatureByFips.get(context.tooltip.data.fips);

							if (countyFeature) {
								$$renderer.push('<!--[0-->');

								GeoPath($$renderer, {
									geojson: countyFeature,
									class: 'fill-surface-content/10 stroke-surface-content',
									strokeWidth: 1
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.county_name)}, ${$.escape(data.state_name)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tooltip.List) {
							$$renderer.push('<!--[-->');

							Tooltip.List($$renderer, {
								children: ($$renderer) => {
									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'Democrat',
											value: data.votes_dem,
											format: 'integer',
											valueAlign: 'right'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'Republican',
											value: data.votes_gop,
											format: 'integer',
											valueAlign: 'right'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'Total',
											value: data.total_votes,
											format: 'integer',
											valueAlign: 'right'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');
						Tooltip.Root($$renderer, { context, children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			Chart($$renderer, {
				data: vectorData,
				x: 'cx',
				y: 'cy',
				geo: { projection, fitGeojson: states },
				r: 'voteDiff',
				rRange: [0, 50],
				height: 600,
				clip: true,
				tooltipContext: { mode: 'quadtree' },
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}