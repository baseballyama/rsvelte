import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoOrthographic } from 'd3-geo';
import { curveCatmullRomClosed } from 'd3-shape';
import { feature } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';
import { Chart, Layer } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import GeoPathGlobeControls2 from '$lib/components/controls/GeoPathGlobeControls2.svelte';
import { TimerState } from '@layerstack/svelte-state';

const topology = await getCountriesTopology();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Sketchy_globe($$anchor, $$props) {
	$.push($$props, true);

	let curve = $.state($.proxy(curveCatmullRomClosed));
	let minArea = $.state(2);
	let context = $.state(null);
	let velocity = $.state(1);
	const simplifiedGeojson = $.derived(() => simplify(presimplify(topology), Math.pow(10, 2 - $.get(minArea))));
	const land = $.derived(() => feature($.get(simplifiedGeojson), topology.objects.land));

	const timer = new TimerState({
		delay: 1,
		tick: () => {
			if (!$.get(context)) return;

			const curr = $.get(context).transform.translate;

			$.get(context).transform.translate = { x: curr.x += $.get(velocity), y: curr.y };
		},
		disabled: true
	});

	const data = { topology, land: $.get(land) };
	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	GeoPathGlobeControls2(node, {
		get timer() {
			return timer;
		},

		get curve() {
			return $.get(curve);
		},

		set curve($$value) {
			$.set(curve, $$value, true);
		},

		get minArea() {
			return $.get(minArea);
		},

		set minArea($$value) {
			$.set(minArea, $$value, true);
		},

		get velocity() {
			return $.get(velocity);
		},

		set velocity($$value) {
			$.set(velocity, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({ projection: geoOrthographic, fitGeojson: $.get(land) }));

		Chart(node_1, {
			get geo() {
				return $.get($0);
			},
			transform: { mode: 'projection' },
			get ondragstart() {
				return timer.stop;
			},
			padding: { top: 5, bottom: 5, left: 5, right: 5 },
			height: 600,
			get context() {
				return $.get(context);
			},

			set context($$value) {
				$.set(context, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						GeoPath(node_2, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/50' });

						var node_3 = $.sibling(node_2, 2);

						Graticule(node_3, { class: 'stroke-surface-content/20' });

						var node_4 = $.sibling(node_3, 2);

						GeoPath(node_4, {
							get geojson() {
								return $.get(land);
							},

							get curve() {
								return $.get(curve);
							},
							class: 'stroke-surface-content/50 fill-white'
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}