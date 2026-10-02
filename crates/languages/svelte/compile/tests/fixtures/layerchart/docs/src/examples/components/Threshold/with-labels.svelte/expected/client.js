import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { curveStepAfter } from 'd3-shape';
import { AreaChart, Area, Spline, Threshold } from 'layerchart';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!>`, 1);

export default function With_labels($$anchor, $$props) {
	$.push($$props, true);

	let selectedCurve = $.state($.proxy(curveStepAfter));

	const data = createDateSeries({
		count: 30,
		min: 50,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	CurveMenuField(node, {
		class: 'mb-8',
		get value() {
			return $.get(selectedCurve);
		},

		set value($$value) {
			$.set(selectedCurve, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		const marks = ($$anchor) => {
			{
				const above = ($$anchor, $$arg0) => {
					let curve = () => ($$arg0?.()).curve;

					Area($$anchor, {
						y0: 'value',
						y1: 'baseline',
						get curve() {
							return curve();
						},
						class: 'fill-success/30'
					});
				};

				const below = ($$anchor, $$arg0) => {
					let curve = () => ($$arg0?.()).curve;

					Area($$anchor, {
						y0: 'value',
						y1: 'baseline',
						get curve() {
							return curve();
						},
						class: 'fill-danger/30'
					});
				};

				const children = ($$anchor, $$arg0) => {
					let curve = () => ($$arg0?.()).curve;
					var fragment_4 = root();
					var node_2 = $.first_child(fragment_4);

					Spline(node_2, {
						y: 'baseline',
						get curve() {
							return curve();
						},
						class: '[stroke-dasharray:4]'
					});

					var node_3 = $.sibling(node_2, 2);

					Spline(node_3, {
						y: 'value',
						get curve() {
							return curve();
						},
						class: 'stroke-[1.5]'
					});

					$.append($$anchor, fragment_4);
				};

				Threshold($$anchor, {
					get curve() {
						return $.get(selectedCurve);
					},
					above,
					below,
					children,
					$$slots: { above: true, below: true, default: true }
				});
			}
		};

		AreaChart(node_1, {
			get data() {
				return data;
			},
			x: 'date',
			y: ['value', 'baseline'],
			padding: { left: 16, bottom: 24 },
			labels: true,
			tooltipContext: false,
			height: 300,
			marks,
			$$slots: { marks: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}