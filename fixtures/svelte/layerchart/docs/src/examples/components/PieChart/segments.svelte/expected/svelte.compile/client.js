import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart, Text } from 'layerchart';
import { Spring } from 'svelte/motion';
import PieChartControls from '$lib/components/controls/PieChartControls.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Segments($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(60);
	let value = new Spring(75);

	let data = $.derived(() => Array.from({ length: $.get(count) }, (_, i) => {
		return {
			key: i + 1,
			value: 1,
			color: i / $.get(count) * 100 < (value.current ?? 0)
				? 'var(--color-success)'
				: 'color-mix(in lch, var(--color-surface-content) 10%, transparent)'
		};
	}));

	var $$exports = {
		get data() {
			return $.get(data);
		}
	};

	var fragment = root();
	var node = $.first_child(fragment);

	PieChartControls(node, {
		get count() {
			return $.get(count);
		},

		set count($$value) {
			$.set(count, $$value, true);
		},

		get value() {
			return value.target;
		},

		set value($$value) {
			value.target = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		const aboveMarks = ($$anchor) => {
			{
				let $0 = $.derived(() => Math.round(value.current ?? 0));

				Text($$anchor, {
					get value() {
						return $.get($0);
					},
					textAnchor: 'middle',
					verticalAnchor: 'middle',
					dy: 16,
					class: 'text-6xl tabular-nums'
				});
			}
		};

		PieChart(node_1, {
			get data() {
				return $.get(data);
			},
			key: 'key',
			value: 'value',
			c: 'color',
			innerRadius: -20,
			cornerRadius: 4,
			padAngle: 0.02,
			tooltipContext: false,
			height: 300,
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}