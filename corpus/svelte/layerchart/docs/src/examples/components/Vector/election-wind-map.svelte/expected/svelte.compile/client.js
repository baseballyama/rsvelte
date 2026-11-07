import 'svelte/internal/disclose-version';
import { getUsCountiesAlbersTopology, getUsPresidentialElection2020 } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { index } from 'd3-array';
import { geoIdentity, geoPath as d3GeoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Vector, Tooltip } from 'layerchart';
import { GeoPath } from 'layerchart/geo';

const topology = await getUsCountiesAlbersTopology();
const electionData = await getUsPresidentialElection2020();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Election_wind_map($$anchor, $$props) {
	$.push($$props, true);

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
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					GeoPath(node_1, {
						get geojson() {
							return states;
						},
						class: 'fill-surface-content/10 stroke-surface-100'
					});

					var node_2 = $.sibling(node_1, 2);

					Vector(node_2, {
						x: 'cx',
						y: 'cy',
						length: 'voteDiff',
						rotate: (d) => d.party === 'dem' ? -60 : 60,
						shape: 'arrow-filled',
						anchor: 'start',
						get data() {
							return vectorData;
						},
						class: (d) => d.party === 'dem' ? 'fill-blue-500' : 'fill-red-500'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			Layer(node_3, {
				pointerEvents: false,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					{
						var consequent_1 = ($$anchor) => {
							const countyFeature = $.derived(() => countyFeatureByFips.get(context().tooltip.data.fips));
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							{
								var consequent = ($$anchor) => {
									GeoPath($$anchor, {
										get geojson() {
											return $.get(countyFeature);
										},
										class: 'fill-surface-content/10 stroke-surface-content',
										strokeWidth: 1
									});
								};

								$.if(node_5, ($$render) => {
									if ($.get(countyFeature)) $$render(consequent);
								});
							}

							$.append($$anchor, fragment_4);
						};

						$.if(node_4, ($$render) => {
							if (context().tooltip.data) $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_3, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_6 = root();
					var node_7 = $.first_child(fragment_6);

					$.component(node_7, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, `${data().county_name ?? ''}, ${data().state_name ?? ''}`));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_8 = $.sibling(node_7, 2);

					$.component(node_8, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root_1();
								var node_9 = $.first_child(fragment_8);

								$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Democrat',
										get value() {
											return data().votes_dem;
										},
										format: 'integer',
										valueAlign: 'right'
									});
								});

								var node_10 = $.sibling(node_9, 2);

								$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'Republican',
										get value() {
											return data().votes_gop;
										},
										format: 'integer',
										valueAlign: 'right'
									});
								});

								var node_11 = $.sibling(node_10, 2);

								$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'Total',
										get value() {
											return data().total_votes;
										},
										format: 'integer',
										valueAlign: 'right'
									});
								});

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_6);
				};

				$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => ({ projection, fitGeojson: states }));

		Chart($$anchor, {
			get data() {
				return vectorData;
			},
			x: 'cx',
			y: 'cy',
			get geo() {
				return $.get($0);
			},
			r: 'voteDiff',
			rRange: [0, 50],
			height: 600,
			clip: true,
			tooltipContext: { mode: 'quadtree' },
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}