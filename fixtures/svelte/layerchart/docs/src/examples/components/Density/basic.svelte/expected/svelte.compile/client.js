import 'svelte/internal/disclose-version';
import { getFaithful } from '$lib/data.remote.js';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Density, Layer, Points } from 'layerchart';

const data = await getFaithful();
var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Basic($$anchor, $$props) {
	$.push($$props, true);

	Chart($$anchor, {
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
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'left', grid: true, rule: true });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'bottom', rule: true });

					var node_2 = $.sibling(node_1, 2);

					Density(node_2, { bandwidth: 10, thresholds: 20, fillOpacity: 0.8 });

					var node_3 = $.sibling(node_2, 2);

					Points(node_3, { r: 1.5, class: 'fill-surface-content/50' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}