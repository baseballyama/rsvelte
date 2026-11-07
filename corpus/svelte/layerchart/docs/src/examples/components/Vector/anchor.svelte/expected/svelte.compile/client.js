import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Vector, Circle, Axis, Layer } from 'layerchart';
import { RangeField } from 'svelte-ux';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="mb-2 screenshot-hidden"><!></div> <!>`, 1);

export default function Anchor($$anchor) {
	let rotate = $.state(45);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'Rotate',
		min: 0,
		max: 360,
		step: 1,
		get value() {
			return $.get(rotate);
		},

		set value($$value) {
			$.set(rotate, $$value, true);
		}
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Chart(node_1, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { top: 10, bottom: 20, left: 24, right: 10 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Axis(node_2, { placement: 'bottom', rule: true });

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, { placement: 'left', rule: true });

					var node_4 = $.sibling(node_3, 2);

					Circle(node_4, { cx: 100, cy: 150, r: 3, class: 'fill-primary' });

					var node_5 = $.sibling(node_4, 2);

					Vector(node_5, {
						x: 100,
						y: 150,
						length: 40,
						width: 5,
						get rotate() {
							return $.get(rotate);
						},
						anchor: 'start',
						class: 'stroke-primary'
					});

					var node_6 = $.sibling(node_5, 2);

					Circle(node_6, { cx: 200, cy: 150, r: 3, class: 'fill-secondary' });

					var node_7 = $.sibling(node_6, 2);

					Vector(node_7, {
						x: 200,
						y: 150,
						length: 40,
						width: 5,
						get rotate() {
							return $.get(rotate);
						},
						anchor: 'middle',
						class: 'stroke-secondary'
					});

					var node_8 = $.sibling(node_7, 2);

					Circle(node_8, { cx: 300, cy: 150, r: 3, class: 'fill-danger' });

					var node_9 = $.sibling(node_8, 2);

					Vector(node_9, {
						x: 300,
						y: 150,
						length: 40,
						width: 5,
						get rotate() {
							return $.get(rotate);
						},
						anchor: 'end',
						class: 'stroke-danger'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}