import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleSequential } from 'd3-scale';
import { interpolateRdBu } from 'd3-scale-chromatic';
import { Axis, Chart, Contour, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Sampled($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(() => scaleSequential(interpolateRdBu));

		Chart($$anchor, {
			get cScale() {
				return $.get($0);
			},
			xDomain: [0, 6 * Math.PI],
			yDomain: [0, 4 * Math.PI],
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

						Contour(node_2, { value: (x, y) => Math.sin(x) * Math.cos(y), thresholds: 20 });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}