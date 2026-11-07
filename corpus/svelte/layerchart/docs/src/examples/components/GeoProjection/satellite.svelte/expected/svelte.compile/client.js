import 'svelte/internal/disclose-version';
import { getUsStatesTopology } from '$lib/geo.remote';
import * as $ from 'svelte/internal/client';
import { geoSatellite } from 'd3-geo-projection';
import { merge } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import { RangeField } from 'svelte-ux';

const topology = await getUsStatesTopology();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-[1fr_1fr_1fr] gap-3 mb-2"><!> <!> <!> <!> <!> <!></div> <!>`, 1);

export default function Satellite($$anchor, $$props) {
	$.push($$props, true);

	const land = merge(topology, topology.objects.states.geometries);
	let yaw = $.state(76);
	let pitch = $.state(-34.5);
	let roll = $.state(32.12);
	let distance = $.state(1.1);
	let scale = $.state(5500);
	let tilt = $.state(25);
	const clipAngle = $.derived(() => Math.acos(1 / $.get(distance)) * 180 / Math.PI - 1e-6);

	const projection = $.derived(() => () => {
		const p = geoSatellite().distance($.get(distance)).tilt($.get(tilt)).scale($.get(scale)).rotate([$.get(yaw), $.get(pitch), $.get(roll)]).center([-2, 5]);

		p.clipAngle($.get(clipAngle));

		return p;
	});

	const data = { topology };
	var $$exports = { data };
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'Yaw',
		min: -180,
		max: 180,
		step: 1,
		get value() {
			return $.get(yaw);
		},

		set value($$value) {
			$.set(yaw, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'Pitch',
		min: -90,
		max: 90,
		step: 1,
		get value() {
			return $.get(pitch);
		},

		set value($$value) {
			$.set(pitch, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	RangeField(node_2, {
		label: 'Roll',
		min: -180,
		max: 180,
		step: 1,
		get value() {
			return $.get(roll);
		},

		set value($$value) {
			$.set(roll, $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	RangeField(node_3, {
		label: 'Distance',
		min: 1.01,
		max: 10,
		step: 0.01,
		get value() {
			return $.get(distance);
		},

		set value($$value) {
			$.set(distance, $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	RangeField(node_4, {
		label: 'Scale',
		min: 500,
		max: 20000,
		step: 100,
		get value() {
			return $.get(scale);
		},

		set value($$value) {
			$.set(scale, $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	RangeField(node_5, {
		label: 'Tilt',
		min: -90,
		max: 90,
		step: 1,
		get value() {
			return $.get(tilt);
		},

		set value($$value) {
			$.set(tilt, $$value, true);
		}
	});

	$.reset(div);

	var node_6 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => ({ projection: $.get(projection) }));

		Chart(node_6, {
			get geo() {
				return $.get($0);
			},
			padding: { top: 16, bottom: 16, left: 16, right: 16 },
			height: 600,
			clip: true,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_7 = $.first_child(fragment_2);

						GeoPath(node_7, {
							geojson: { type: 'Sphere' },
							class: 'stroke-surface-content/30'
						});

						var node_8 = $.sibling(node_7, 2);

						Graticule(node_8, { class: 'stroke-surface-content/10' });

						var node_9 = $.sibling(node_8, 2);

						GeoPath(node_9, {
							get geojson() {
								return land;
							},
							class: 'fill-surface-content/10 stroke-surface-content/30'
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