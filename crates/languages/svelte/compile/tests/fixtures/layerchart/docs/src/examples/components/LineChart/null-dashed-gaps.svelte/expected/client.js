import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, Spline, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Null_dashed_gaps($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' }).map((d) => {
		return { ...d, value: Math.random() < 0.2 ? null : d.value };
	});

	var $$exports = { data };

	{
		const belowMarks = ($$anchor, $$arg0) => {
			let series = () => ($$arg0?.()).series;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, series, $.index, ($$anchor, s) => {
				{
					let $0 = $.derived(() => data.filter((d) => d.value !== null));

					Spline($$anchor, {
						get data() {
							return $.get($0);
						},

						get y() {
							return $.get(s).value;
						},
						class: '[stroke-dasharray:3,3]',
						get stroke() {
							return $.get(s).color;
						}
					});
				}
			});

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => defaultChartPadding({ right: 10 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get padding() {
				return $.get($0);
			},
			height: 300,
			belowMarks,
			$$slots: { belowMarks: true }
		});
	}

	return $.pop($$exports);
}