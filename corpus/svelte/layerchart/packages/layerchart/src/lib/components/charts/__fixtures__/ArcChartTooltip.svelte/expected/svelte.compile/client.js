import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArcChart from '../ArcChart/ArcChart.svelte';

var root = $.from_html(`<span class="arc-chart-tooltip-label"> </span> <span class="arc-chart-tooltip-value"> </span>`, 1);
var root_1 = $.from_html(`<div class="arc-chart-tooltip"></div>`);

export default function ArcChartTooltip($$anchor) {
	const data = [
		{ browser: 'other', visitors: 90, color: 'gray' },
		{ browser: 'edge', visitors: 173, color: 'green' },
		{ browser: 'firefox', visitors: 187, color: 'orange' },
		{ browser: 'safari', visitors: 200, color: 'blue' },
		{ browser: 'chrome', visitors: 275, color: 'red' }
	];

	const series = data.map((datum) => ({
		key: datum.browser,
		label: datum.browser,
		color: datum.color,
		data: [datum]
	}));

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const visibleSeries = $.derived(() => context().tooltip.series.filter((series) => series.value !== undefined));
			var div = root_1();

			$.each(div, 21, () => $.get(visibleSeries), (series) => series.key, ($$anchor, series, $$index, $$array) => {
				var fragment_1 = root();
				var span = $.first_child(fragment_1);
				var text = $.only_child(span, true);
				var span_1 = $.sibling(span, 2);
				var text_1 = $.only_child(span_1, true);

				$.template_effect(() => {
					$.set_text(text, $.get(series).label);
					$.set_text(text_1, $.get(series).value);
				});

				$.append($$anchor, fragment_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		ArcChart($$anchor, {
			get data() {
				return data;
			},
			label: 'browser',
			value: 'visitors',
			innerRadius: 40,
			outerRadius: 70,
			height: 240,
			width: 240,
			get series() {
				return series;
			},
			tooltip,
			$$slots: { tooltip: true }
		});
	}
}