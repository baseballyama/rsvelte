import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleThreshold } from 'd3-scale';
import { AnnotationLine, Chart, Rect, Axis, Layer } from 'layerchart';
import { bin } from 'd3-array';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Color_via_threshold_scale($$anchor, $$props) {
	$.push($$props, true);

	const raw = [
		12,
		15,
		18,
		21,
		23,
		25,
		27,
		28,
		30,
		32,
		34,
		35,
		37,
		38,
		40,
		42,
		44,
		45,
		48,
		50,
		52,
		55,
		58,
		60,
		62,
		65,
		68,
		70,
		72,
		75
	];

	const histogram = bin().thresholds(8)(raw);
	const data = histogram.map((b) => ({ x0: b.x0, x1: b.x1, count: b.length }));

	{
		let $0 = $.derived(scaleThreshold);

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: ['x0', 'x1'],
			y: 'count',
			yDomain: [0, null],
			yNice: true,
			c: 'count',
			get cScale() {
				return $.get($0);
			},
			cDomain: [3, 5],
			cRange: [
				'var(--color-danger)',
				'var(--color-warning)',
				'var(--color-success)'
			],
			padding: { top: 20, bottom: 20, left: 24, right: 10 },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'bottom', rule: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'left', rule: true });

						var node_2 = $.sibling(node_1, 2);

						AnnotationLine(node_2, {
							y: 3,
							props: {
								line: {
									dashArray: [4],
									stroke: 'var(--color-danger)',
									strokeOpacity: 0.5
								}
							}
						});

						var node_3 = $.sibling(node_2, 2);

						AnnotationLine(node_3, {
							y: 5,
							props: {
								line: {
									dashArray: [4],
									stroke: 'var(--color-success)',
									strokeOpacity: 0.5
								}
							}
						});

						var node_4 = $.sibling(node_3, 2);

						Rect(node_4, {
							x0: 'x0',
							y0: (d) => 0,
							x1: 'x1',
							y1: 'count',
							insets: { x: 1 },
							fill: 'count'
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