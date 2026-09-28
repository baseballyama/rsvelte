import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, ScaledSvg } from 'layercake';
import { nest } from 'd3-collection';
import { scaleQuantize } from 'd3-scale';
import CalendarMonth from '../../_components/CalendarMonth.svelte';
import dates from '../../_data/dates.csv';

var root = $.from_html(`<div class="chart-container svelte-10ew7kq"><!></div>`);

export default function Calendar($$anchor, $$props) {
	$.push($$props, true);

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
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => sortedData, $.index, ($$anchor, month, i) => {
		var div = root();
		var node_1 = $.child(div);

		{
			let $0 = $.derived(scaleQuantize);

			LayerCake(node_1, {
				ssr: true,
				percentRange: true,
				padding: { top: 1, right: 1, bottom: 1, left: 1 },
				x: 'key',
				z: (d) => d.values.length,
				get zScale() {
					return $.get($0);
				},

				get zRange() {
					return seriesColors;
				},

				get data() {
					return $.get(month).values;
				},

				children: ($$anchor, $$slotProps) => {
					ScaledSvg($$anchor, {
						children: ($$anchor, $$slotProps) => {
							CalendarMonth($$anchor, { calcCellSize: () => 100 / 7 });
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$.reset(div);

		$.template_effect(() => {
			$.set_style(div, `width:calc(${100 / sortedData.length}% - 10px);${i === 0 ? `margin-right:${gutter * 2}px` : ''}`);
			$.set_attribute(div, 'data-month', monthNames[+$.get(month).key]);
		});

		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
	$.pop();
}