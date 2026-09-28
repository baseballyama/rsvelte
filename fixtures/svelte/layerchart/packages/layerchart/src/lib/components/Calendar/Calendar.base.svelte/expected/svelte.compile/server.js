import * as $ from 'svelte/internal/server';
import { timeDays, timeMonths, timeWeek } from 'd3-time';
import { index } from 'd3-array';
import { format } from '@layerstack/utils';
import MonthPath from '../MonthPath.svelte';
import '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getMarkData } from '$lib/contexts/facet.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function Calendar_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MonthPath isn't split — only used here when `monthPath` is set.
		let {
			Rect,
			Text,
			end,
			start,
			cellSize: cellSizeProp,
			monthPath = false,
			monthLabel = true,
			tooltip,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const ctx = getChartContext();
		const markData = getMarkData();
		const yearDays = $.derived(() => timeDays(start, end));
		const yearMonths = $.derived(() => timeMonths(start, end));
		const yearWeeks = $.derived(() => timeWeek.count(start, end));
		const chartCellWidth = $.derived(() => ctx.width / (yearWeeks() + 1));
		const chartCellHeight = $.derived(() => ctx.height / 7);
		const chartCellSize = $.derived(() => Math.min(chartCellWidth(), chartCellHeight()));

		const cellSize = $.derived(() => Array.isArray(cellSizeProp)
			? cellSizeProp
			: typeof cellSizeProp === 'number'
				? [cellSizeProp, cellSizeProp]
				: [chartCellSize(), chartCellSize()]);

		const dataByDate = $.derived(() => ctx.data && ctx.config.x ? index(markData(), (d) => ctx.x(d)) : new Map());

		const cells = $.derived(() => yearDays().map((date) => {
			const cellData = dataByDate().get(date) ?? { date };

			return {
				x: timeWeek.count(start, date) * cellSize()[0],
				y: date.getDay() * cellSize()[1],
				color: ctx.config.c ? ctx.cGet(cellData) : 'transparent',
				data: cellData
			};
		}));

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer, { cells: cells(), cellSize: cellSize() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array = $.ensure_array_like(cells());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let cell = each_array[$$index];

				if (Rect) {
					$$renderer.push('<!--[-->');

					Rect($$renderer, $.spread_props([
						{
							x: cell.x,
							y: cell.y,
							width: cellSize()[0],
							height: cellSize()[1],
							fill: cell.color,
							onpointermove: (e) => tooltip && ctx.tooltip?.show(e, cell.data),
							onpointerleave: () => tooltip && ctx.tooltip?.hide(),
							strokeWidth: 1
						},
						extractLayerProps(restProps, 'lc-calendar-cell')
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> `);

		if (monthPath) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array_1 = $.ensure_array_like(yearMonths());

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let date = each_array_1[$$index_1];

				MonthPath($$renderer, $.spread_props([
					{ date, startOfRange: start, cellSize: cellSize() },
					extractLayerProps(monthPath, 'lc-calendar-month-path')
				]));
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (monthLabel) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array_2 = $.ensure_array_like(yearMonths());

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let date = each_array_2[$$index_2];

				if (Text) {
					$$renderer.push('<!--[-->');

					Text($$renderer, $.spread_props([
						{
							x: timeWeek.count(start, timeWeek.ceil(date)) * cellSize()[0],
							value: format(date, 'month', { variant: 'short' }),
							capHeight: '7px'
						},
						extractLayerProps(monthLabel, 'lc-calendar-month-label')
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}