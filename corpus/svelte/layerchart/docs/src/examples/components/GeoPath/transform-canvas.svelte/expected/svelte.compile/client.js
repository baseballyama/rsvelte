import 'svelte/internal/disclose-version';
import { getUsCountiesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';
import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Tooltip, getSettings } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import GeoPathProjectionControls from '$lib/components/controls/GeoPathProjectionControls.svelte';

const geojson = await getUsCountiesTopology();
var root = $.from_svg(`<g><!></g>`);
var root_1 = $.from_svg(`<!><!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Transform_canvas($$anchor, $$props) {
	$.push($$props, true);

	let settings = getSettings();
	let projection = $.state($.proxy(geoAlbersUsa));

	const projections = [
		{ label: 'Albers', value: geoAlbers },
		{ label: 'Albers USA', value: geoAlbersUsa },
		{ label: 'Mercator', value: geoMercator }
	];

	const counties = feature(geojson, geojson.objects.counties);
	const states = feature(geojson, geojson.objects.states);

	const contiguousStates = $.derived(() => ({
		...states,
		features: states.features.filter((d) => {
			// Contiguous states
			return Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii';
		})
	}));

	let selectedStateId = $.state(null);

	const selectedCountiesFeatures = $.derived(() => $.get(selectedStateId)
		? counties.features.filter((f) => f.id.slice(0, 2) === $.get(selectedStateId))
		: []);

	const data = {
		geojson,
		counties,
		states,
		contiguousStates: $.get(contiguousStates)
	};

	var $$exports = { data };
	var fragment = root_3();
	var node = $.first_child(fragment);

	GeoPathProjectionControls(node, {
		get projections() {
			return projections;
		},

		get projection() {
			return $.get(projection);
		},

		set projection($$value) {
			$.set(projection, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_2();
			var node_2 = $.first_child(fragment_1);

			TransformContextControls(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			Layer(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_4 = $.first_child(fragment_2);

					$.each(node_4, 17, () => states.features, $.index, ($$anchor, feature, $$index, $$array) => {
						{
							let $0 = $.derived(() => 1 / context().transform.scale);

							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},
								class: 'stroke-surface-content fill-surface-100 hover:fill-surface-content/10',
								get strokeWidth() {
									return $.get($0);
								},
								tooltip: true,
								onclick: (e, geoPath) => {
									context().tooltip.hide();

									if ($.get(selectedStateId) === $.get(feature).id) {
										$.set(selectedStateId, null);
										context().transform.reset();
									} else {
										$.set(selectedStateId, $.get(feature).id, true);

										if (!geoPath) return;

										const [[left, top], [right, bottom]] = geoPath.bounds($.get(feature));
										const width = right - left;
										const height = bottom - top;
										const x = (left + right) / 2;
										const y = (top + bottom) / 2;
										const padding = 20;

										context().transform.zoomTo({ x, y }, { width: width + padding, height: height + padding });
									}
								}
							});
						}
					});

					var node_5 = $.sibling(node_4);

					$.each(node_5, 17, () => $.get(selectedCountiesFeatures), (feature) => feature.id, ($$anchor, feature, $$index_1, $$array_1) => {
						var g = root();
						var node_6 = $.child(g);

						{
							let $0 = $.derived(() => 1 / context().transform.scale);

							GeoPath(node_6, {
								get geojson() {
									return $.get(feature);
								},
								tooltip: true,
								get strokeWidth() {
									return $.get($0);
								},
								class: 'stroke-surface-content/10 hover:stroke-surface-content/50 hover:fill-surface-content/10',
								onclick: () => {
									$.set(selectedStateId, null);
									context().transform.reset();
								}
							});
						}

						$.reset(g);
						$.transition(1, g, () => fade, () => ({ duration: 300, delay: 600 }));
						$.transition(2, g, () => fade, () => ({ duration: 300 }));
						$.append($$anchor, g);
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_3, 2);

			Layer(node_7, {
				pointerEvents: false,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_8 = $.first_child(fragment_4);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => 1 / context().transform.scale);

								GeoPath($$anchor, {
									get geojson() {
										return context().tooltip.data;
									},

									get strokeWidth() {
										return $.get($0);
									},
									class: 'stroke-surface-content/50 fill-surface-content/20'
								});
							}
						};

						$.if(node_8, ($$render) => {
							if (context().tooltip.data && settings.layer === 'canvas') $$render(consequent);
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_7, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, data().properties.name));
					$.append($$anchor, text);
				};

				$.component(node_9, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => ({
			projection: $.get(projection),
			fitGeojson: $.get(projection) === geoMercator ? $.get(contiguousStates) : states
		}));

		let $1 = $.derived(() => ({
			mode: 'canvas',
			scrollMode: 'none',
			motion: { type: 'tween', duration: 800, easing: cubicOut }
		}));

		Chart(node_1, {
			get geo() {
				return $.get($0);
			},

			get transform() {
				return $.get($1);
			},
			height: 600,
			clip: true,
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}