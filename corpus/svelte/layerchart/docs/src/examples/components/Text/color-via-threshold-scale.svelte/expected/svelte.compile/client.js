import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleThreshold } from 'd3-scale';
import { AnnotationLine, Chart, Circle, Text, Axis, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Color_via_threshold_scale($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ date: new Date('2024-01-01'), value: 10, label: 'Jan' },
		{ date: new Date('2024-03-01'), value: 35, label: 'Mar' },
		{ date: new Date('2024-05-01'), value: 22, label: 'May' },
		{ date: new Date('2024-07-01'), value: 48, label: 'Jul' },
		{ date: new Date('2024-09-01'), value: 80, label: 'Sep' },
		{ date: new Date('2024-11-01'), value: 92, label: 'Nov' }
	];

	{
		let $0 = $.derived(scaleThreshold);

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yDomain: [0, 100],
			c: 'value',
			get cScale() {
				return $.get($0);
			},
			cDomain: [50, 90],
			cRange: [
				'var(--color-danger)',
				'var(--color-warning)',
				'var(--color-success)'
			],
			padding: { top: 30, bottom: 20, left: 24, right: 10 },
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
							y: 50,
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
							y: 90,
							props: {
								line: {
									dashArray: [4],
									stroke: 'var(--color-success)',
									strokeOpacity: 0.5
								}
							}
						});

						var node_4 = $.sibling(node_3, 2);

						Circle(node_4, { cx: 'date', cy: 'value', r: 4, fill: 'value' });

						var node_5 = $.sibling(node_4, 2);

						Text(node_5, {
							x: 'date',
							y: 'value',
							value: 'label',
							textAnchor: 'middle',
							dy: -8,
							fill: 'value',
							class: 'text-xs'
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