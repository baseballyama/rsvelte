import 'svelte/internal/disclose-version';
import { getVolcano } from '$lib/data.remote.js';
import * as $ from 'svelte/internal/client';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { Axis, Chart, Contour, Layer, Raster } from 'layerchart';

const volcano = await getVolcano();
var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function With_contour_overlay($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(() => scaleSequential(interpolateTurbo));

		Chart($$anchor, {
			get cScale() {
				return $.get($0);
			},
			padding: { left: 30, bottom: 24, top: 8, right: 8 },
			height: 400,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'left', rule: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'bottom', rule: true });

						var node_2 = $.sibling(node_1, 2);

						Raster(node_2, {
							get data() {
								return volcano.values;
							},

							get width() {
								return volcano.width;
							},

							get height() {
								return volcano.height;
							}
						});

						var node_3 = $.sibling(node_2, 2);

						Contour(node_3, {
							get data() {
								return volcano.values;
							},

							get width() {
								return volcano.width;
							},

							get height() {
								return volcano.height;
							},
							fill: 'none',
							stroke: 'white',
							strokeWidth: 0.5,
							thresholds: 20
						});

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