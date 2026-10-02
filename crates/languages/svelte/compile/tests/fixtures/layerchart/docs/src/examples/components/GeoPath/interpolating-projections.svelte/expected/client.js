import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { cubicInOut } from 'svelte/easing';

import {
	geoProjection,
	geoEquirectangularRaw,
	geoMercatorRaw,
	geoNaturalEarth1Raw,
	geoEqualEarthRaw,
	geoOrthographicRaw,
	geoStereographicRaw,
	geoGnomonicRaw
} from 'd3-geo';

import {
	geoAitoffRaw,
	geoAugustRaw,
	geoBakerRaw,
	geoBoggsRaw,
	geoBromleyRaw,
	geoCollignonRaw,
	geoCrasterRaw,
	geoEckert1Raw,
	geoEckert3Raw,
	geoEckert5Raw,
	geoFaheyRaw,
	geoKavrayskiy7Raw,
	geoLarriveeRaw,
	geoMillerRaw,
	geoNaturalEarth2Raw,
	geoPattersonRaw,
	geoRobinsonRaw,
	geoSinusoidalRaw,
	geoTimesRaw,
	geoVanDerGrintenRaw,
	geoWiechelRaw,
	geoWinkel3Raw
} from 'd3-geo-projection';

import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import { Button, ButtonGroup, Field, RangeField, SelectField, Switch } from 'svelte-ux';

const topology = await getCountriesTopology();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-cols-[1fr_1fr] gap-2 mb-4 screenshot-hidden"><!> <!></div> <div class="flex gap-4 items-center mb-4 screenshot-hidden"><!> <!> <!> <!></div> <!>`, 1);

export default function Interpolating_projections($$anchor, $$props) {
	$.push($$props, true);

	const land = feature(topology, topology.objects.land);

	const projections = [
		{ label: 'Aitoff', value: geoAitoffRaw },
		{ label: 'August', value: geoAugustRaw },
		{ label: 'Baker', value: geoBakerRaw },
		{ label: 'Boggs', value: geoBoggsRaw },
		{ label: 'Bromley', value: geoBromleyRaw },
		{ label: 'Collignon', value: geoCollignonRaw },
		{ label: 'Craster', value: geoCrasterRaw },
		{ label: 'Eckert I', value: geoEckert1Raw },
		{ label: 'Eckert III', value: geoEckert3Raw },
		{ label: 'Eckert V', value: geoEckert5Raw },
		{ label: 'Equal Earth', value: geoEqualEarthRaw },
		{ label: 'Equirectangular', value: geoEquirectangularRaw },
		{ label: 'Fahey', value: geoFaheyRaw },
		{ label: 'Gnomonic', value: geoGnomonicRaw },
		{ label: 'Kavrayskiy VII', value: geoKavrayskiy7Raw },
		{ label: 'Larrivee', value: geoLarriveeRaw },
		{ label: 'Mercator', value: geoMercatorRaw },
		{ label: 'Miller', value: geoMillerRaw },
		{ label: 'Natural Earth 1', value: geoNaturalEarth1Raw },
		{ label: 'Natural Earth 2', value: geoNaturalEarth2Raw },
		{ label: 'Orthographic', value: geoOrthographicRaw },
		{ label: 'Patterson', value: geoPattersonRaw },
		{ label: 'Robinson', value: geoRobinsonRaw },
		{ label: 'Sinusoidal', value: geoSinusoidalRaw },
		{ label: 'Stereographic', value: geoStereographicRaw },
		{ label: 'Times', value: geoTimesRaw },
		{ label: 'Van der Grinten', value: geoVanDerGrintenRaw },
		{ label: 'Wiechel', value: geoWiechelRaw },
		{ label: 'Winkel Tripel', value: geoWinkel3Raw }
	];

	const FRAMES = 480;
	let rawFrom = $.state($.proxy(geoMercatorRaw));
	let rawTo = $.state($.proxy(geoOrthographicRaw));
	let showGraticule = $.state(true);
	let animating = $.state(true);
	let currentFrame = $.state(0);
	let manualT = $.state(0);
	let scale = $.state(150);

	// Ping-pong easing: 0 -> 1 -> 0 over 2*FRAMES
	const animatedT = $.derived(() => {
		const frame = $.get(currentFrame) % (FRAMES * 2);
		const phase = frame < FRAMES ? frame / FRAMES : 2 - frame / FRAMES;

		return cubicInOut(phase);
	});

	const t = $.derived(() => $.get(animating) ? $.get(animatedT) : $.get(manualT));

	// Interpolated projection factory -- recreated each frame as t updates
	const projectionFactory = $.derived(() => {
		const currentT = $.get(t);
		const r0 = $.get(rawFrom);
		const r1 = $.get(rawTo);

		return () => {
			const raw = (lambda, phi) => {
				const [x0, y0] = r0(lambda, phi);
				const [x1, y1] = r1(lambda, phi);

				return [x0 + currentT * (x1 - x0), y0 + currentT * (y1 - y0)];
			};

			return geoProjection(raw).precision(0.1);
		};
	});

	// Animation loop
	$.user_effect(() => {
		if (!$.get(animating)) return;

		let rafId;

		function tick() {
			$.update(currentFrame);
			rafId = requestAnimationFrame(tick);
		}

		rafId = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(rafId);
	});

	const data = { topology };
	var $$exports = { data };
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	SelectField(node, {
		label: 'From',
		get options() {
			return projections;
		},
		clearable: false,
		toggleIcon: null,
		stepper: true,
		get value() {
			return $.get(rawFrom);
		},

		set value($$value) {
			$.set(rawFrom, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	SelectField(node_1, {
		label: 'To',
		get options() {
			return projections;
		},
		clearable: false,
		toggleIcon: null,
		stepper: true,
		get value() {
			return $.get(rawTo);
		},

		set value($$value) {
			$.set(rawTo, $$value, true);
		}
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_2 = $.child(div_1);

	Field(node_2, {
		label: 'Graticule',
		dense: true,
		labelPlacement: 'left',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},
					size: 'md',
					get checked() {
						return $.get(showGraticule);
					},

					set checked($$value) {
						$.set(showGraticule, $$value, true);
					}
				});
			}
		}
	});

	var node_3 = $.sibling(node_2, 2);

	ButtonGroup(node_3, {
		size: 'sm',
		variant: 'fill-light',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_4 = $.first_child(fragment_2);

			Button(node_4, {
				get disabled() {
					return $.get(animating);
				},
				$$events: { click: () => $.set(animating, true) },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Play');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			{
				let $0 = $.derived(() => !$.get(animating));

				Button(node_5, {
					get disabled() {
						return $.get($0);
					},
					$$events: { click: () => $.set(animating, false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Pause');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	RangeField(node_6, {
		label: 'Blend',
		min: 0,
		max: 1,
		step: 0.001,
		get disabled() {
			return $.get(animating);
		},
		class: 'flex-1',
		get value() {
			return $.get(manualT);
		},

		set value($$value) {
			$.set(manualT, $$value, true);
		}
	});

	var node_7 = $.sibling(node_6, 2);

	RangeField(node_7, {
		label: 'Scale',
		min: 10,
		max: 500,
		step: 1,
		class: 'flex-1',
		get value() {
			return $.get(scale);
		},

		set value($$value) {
			$.set(scale, $$value, true);
		}
	});

	$.reset(div_1);

	var node_8 = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => ({ projection: $.get(projectionFactory), scale: $.get(scale) }));

		Chart(node_8, {
			get geo() {
				return $.get($0);
			},
			height: 800,
			clip: true,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_1();
						var node_9 = $.first_child(fragment_4);

						GeoPath(node_9, {
							geojson: { type: 'Sphere' },
							class: 'stroke-surface-content/20 fill-none'
						});

						var node_10 = $.sibling(node_9, 2);

						{
							var consequent = ($$anchor) => {
								Graticule($$anchor, { class: 'stroke-surface-content/10' });
							};

							$.if(node_10, ($$render) => {
								if ($.get(showGraticule)) $$render(consequent);
							});
						}

						var node_11 = $.sibling(node_10, 2);

						GeoPath(node_11, {
							get geojson() {
								return land;
							},
							class: 'fill-surface-content/15'
						});

						$.append($$anchor, fragment_4);
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