import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleThreshold } from 'd3-scale';
import { AnnotationLine, Axis, Chart, Layer, Points } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Color_via_threshold_scale($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ min: 10, max: 100, value: 'integer' });
	var $$exports = { data };

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
			padding: 20,
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'left', grid: true, rule: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'bottom', rule: true });

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
							class: '[stroke-dasharray:4] opacity-20',
							props: {
								line: {
									dashArray: [4],
									stroke: 'var(--color-success)',
									strokeOpacity: 0.5
								}
							}
						});

						var node_4 = $.sibling(node_3, 2);

						Points(node_4, {});
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}