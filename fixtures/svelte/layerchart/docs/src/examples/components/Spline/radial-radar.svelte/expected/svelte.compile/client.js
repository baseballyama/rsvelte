import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { curveLinearClosed } from 'd3-shape';
import { Axis, Chart, Layer, Points, Spline } from 'layerchart';
import RadialControls from '$lib/components/controls/fields/RadialField.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Radial_radar($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ name: 'fastball', value: 10 },
		{ name: 'change', value: 0 },
		{ name: 'slider', value: 4 },
		{ name: 'cutter', value: 8 },
		{ name: 'curve', value: 5 }
	];

	let curve = $.state($.proxy(curveLinearClosed));
	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	RadialControls(node, {
		get curve() {
			return $.get(curve);
		},

		set curve($$value) {
			$.set(curve, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Chart(node_1, {
		get data() {
			return data;
		},
		x: 'name',
		y: 'value',
		yPadding: [0, 10],
		padding: { top: 32, bottom: 8 },
		radial: true,
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Axis(node_2, {
						placement: 'radius',
						grid: { class: 'stroke-surface-content/20 fill-surface-200/50' },
						ticks: [0, 5, 10],
						format: (d) => ''
					});

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, {
						placement: 'angle',
						grid: { class: 'stroke-surface-content/20' }
					});

					var node_4 = $.sibling(node_3, 2);

					Spline(node_4, {
						get curve() {
							return $.get(curve);
						},
						class: 'stroke-primary fill-primary/20'
					});

					var node_5 = $.sibling(node_4, 2);

					Points(node_5, { class: 'fill-primary stroke-surface-200' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}