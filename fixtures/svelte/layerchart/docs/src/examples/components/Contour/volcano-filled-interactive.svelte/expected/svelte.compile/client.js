import 'svelte/internal/disclose-version';
import { getVolcano } from '$lib/data.remote.js';
import * as $ from 'svelte/internal/client';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { Axis, Chart, Contour, Layer } from 'layerchart';
import { RangeField } from 'svelte-ux';

const volcano = await getVolcano();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-2 gap-4 mb-4"><!> <!></div> <!>`, 1);

export default function Volcano_filled_interactive($$anchor, $$props) {
	$.push($$props, true);

	let thresholds = $.state(20);
	let blur = $.state(0);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'Thresholds',
		min: 2,
		max: 40,
		step: 1,
		get value() {
			return $.get(thresholds);
		},

		set value($$value) {
			$.set(thresholds, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'Blur',
		min: 0,
		max: 10,
		step: 0.5,
		get value() {
			return $.get(blur);
		},

		set value($$value) {
			$.set(blur, $$value, true);
		}
	});

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => scaleSequential(interpolateTurbo));

		Chart(node_2, {
			get cScale() {
				return $.get($0);
			},
			padding: { left: 30, bottom: 24, top: 8, right: 8 },
			height: 400,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_3 = $.first_child(fragment_2);

						Axis(node_3, { placement: 'left', rule: true });

						var node_4 = $.sibling(node_3, 2);

						Axis(node_4, { placement: 'bottom', rule: true });

						var node_5 = $.sibling(node_4, 2);

						Contour(node_5, {
							get data() {
								return volcano.values;
							},

							get width() {
								return volcano.width;
							},

							get height() {
								return volcano.height;
							},

							get thresholds() {
								return $.get(thresholds);
							},

							get blur() {
								return $.get(blur);
							}
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
	$.pop();
}