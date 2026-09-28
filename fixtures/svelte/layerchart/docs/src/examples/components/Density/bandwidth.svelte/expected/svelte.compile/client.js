import 'svelte/internal/disclose-version';
import { getFaithful } from '$lib/data.remote.js';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Density, Layer, Points } from 'layerchart';
import { RangeField } from 'svelte-ux';

const data = await getFaithful();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="mb-4"><!></div> <!>`, 1);

export default function Bandwidth($$anchor, $$props) {
	$.push($$props, true);

	let bandwidth = $.state(20);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'Bandwidth',
		min: 2,
		max: 50,
		step: 1,
		get value() {
			return $.get(bandwidth);
		},

		set value($$value) {
			$.set(bandwidth, $$value, true);
		}
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Chart(node_1, {
		get data() {
			return data;
		},
		x: 'eruptions',
		y: 'waiting',
		xDomain: [1, 6],
		yDomain: [40, 100],
		xNice: true,
		yNice: true,
		padding: { left: 30, bottom: 24, top: 8, right: 8 },
		height: 400,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Axis(node_2, { placement: 'left', grid: true, rule: true });

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, { placement: 'bottom', rule: true });

					var node_4 = $.sibling(node_3, 2);

					Density(node_4, {
						get bandwidth() {
							return $.get(bandwidth);
						},
						thresholds: 20,
						fillOpacity: 0.8
					});

					var node_5 = $.sibling(node_4, 2);

					Points(node_5, { r: 1.5, class: 'fill-surface-content/50' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}