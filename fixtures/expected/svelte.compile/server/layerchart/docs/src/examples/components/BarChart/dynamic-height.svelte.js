import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';

export default function Dynamic_height($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let data2 = [
			{ name: 'One', value1: 10, value2: 20 },
			{ name: 'Two', value1: 5, value2: 20 }
		];

		let data4 = [
			{ name: 'One', value1: 10, value2: 20 },
			{ name: 'Two', value1: 5, value2: 20 },
			{ name: 'Three', value1: 15, value2: 15 },
			{ name: 'Four', value1: 10, value2: 5 }
		];

		let data6 = [
			{ name: 'One', value1: 10, value2: 20 },
			{ name: 'Two', value1: 5, value2: 20 },
			{ name: 'Three', value1: 15, value2: 15 },
			{ name: 'Four', value1: 10, value2: 5 },
			{ name: 'Five', value1: 8, value2: 5 },
			{ name: 'Size', value1: 3, value2: 5 }
		];

		let seriesCount = 2;
		let data = $.derived(() => seriesCount === 2 ? data2 : seriesCount === 4 ? data4 : data6);
		let barHeight = 50;
		let padding = { top: 4, bottom: 20 };
		let bandPadding = 0.4;
		let chartHeight = $.derived(() => (barHeight + barHeight * bandPadding) * seriesCount + barHeight * bandPadding + padding.top + padding.bottom + 8);

		$$renderer.push(`<label><input${$.attr('checked', seriesCount === 2, true)} type="radio"${$.attr('value', 2)}/> 2</label> <label><input${$.attr('checked', seriesCount === 4, true)} type="radio"${$.attr('value', 4)}/> 4</label> <label><input${$.attr('checked', seriesCount === 6, true)} type="radio"${$.attr('value', 6)}/> 6</label> `);

		BarChart($$renderer, {
			data: data(),
			bandPadding,
			y: 'name',
			series: [
				{ key: 'value1', color: 'hsl(100 100% 50%)' },
				{ key: 'value2', color: 'hsl(200 100% 50%)' }
			],
			orientation: 'horizontal',
			seriesLayout: 'stackExpand',
			padding: defaultChartPadding({ left: 20 }),
			height: chartHeight()
		});

		$$renderer.push(`<!---->`);
	});
}