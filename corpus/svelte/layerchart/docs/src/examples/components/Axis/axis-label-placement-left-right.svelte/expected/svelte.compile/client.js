import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Axis_label_placement_left_right($$anchor) {
	Chart($$anchor, {
		yDomain: [0, 100],
		padding: { top: 24, bottom: 24, left: 40, right: 40 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, {
						label: 'left start',
						placement: 'left',
						labelPlacement: 'start',
						rule: true
					});

					var node_1 = $.sibling(node, 2);

					Axis(node_1, {
						label: 'left middle',
						placement: 'left',
						labelPlacement: 'middle',
						rule: true
					});

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, {
						label: 'left end',
						placement: 'left',
						labelPlacement: 'end',
						rule: true
					});

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, {
						label: 'right start',
						placement: 'right',
						labelPlacement: 'start',
						rule: true
					});

					var node_4 = $.sibling(node_3, 2);

					Axis(node_4, {
						label: 'right middle',
						placement: 'right',
						labelPlacement: 'middle',
						rule: true
					});

					var node_5 = $.sibling(node_4, 2);

					Axis(node_5, {
						label: 'right end',
						placement: 'right',
						labelPlacement: 'end',
						rule: true
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}