import * as $ from 'svelte/internal/server';
import { LayerCake, ScaledSvg } from 'layercake';
import { nest } from 'd3-collection';
import { scaleQuantize } from 'd3-scale';
import CalendarMonth from '../../_components/CalendarMonth.svelte';
import dates from '../../_data/dates.csv';

export default function Calendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const monthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];

		const datesTransformed = dates.map((row) => {
			row.date = new Date(row.timestring);

			return row;
		});

		const gutter = 10;
		const seriesColors = ['#fff5cc', '#ffeba9', '#ffe182', '#ffd754', '#ffcc00'];

		/* --------------------------------------------
		 * Group by month then by date
		 */
		const byMonthByDate = nest().key((d) => d.date.getUTCMonth()).key((d) => d.timestring.split('T')[0]).entries(datesTransformed);

		const sortedData = byMonthByDate.sort((a, b) => a.key - b.key);

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(sortedData);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let month = each_array[i];

			$$renderer.push(`<div class="chart-container svelte-10ew7kq"${$.attr_style(`width:calc(${$.stringify(100 / sortedData.length)}% - 10px);${i === 0 ? `margin-right:${gutter * 2}px` : ''}`)}${$.attr('data-month', monthNames[+month.key])}>`);

			LayerCake($$renderer, {
				ssr: true,
				percentRange: true,
				padding: { top: 1, right: 1, bottom: 1, left: 1 },
				x: 'key',
				z: (d) => d.values.length,
				zScale: scaleQuantize(),
				zRange: seriesColors,
				data: month.values,
				children: ($$renderer) => {
					ScaledSvg($$renderer, {
						children: ($$renderer) => {
							CalendarMonth($$renderer, { calcCellSize: () => 100 / 7 });
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}