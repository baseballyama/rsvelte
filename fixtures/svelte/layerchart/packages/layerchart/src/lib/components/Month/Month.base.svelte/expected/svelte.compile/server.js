import * as $ from 'svelte/internal/server';
import { timeDays, timeWeek } from 'd3-time';
import { index } from 'd3-array';
import { format } from '@layerstack/utils';
import '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getMarkData } from '$lib/contexts/facet.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function Month_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const DAYS_PER_WEEK = 7;

		let {
			Rect,
			Group,
			Text,
			start,
			end,
			cellSize = 25,
			monthsPerRow: monthsPerRowProp,
			monthPadding = 1.2,
			rowSpacing = 8,
			showDayNumber = true,
			monthLabel = true,
			dayNumberProps = {},
			tooltip,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const ctx = getChartContext();
		const markData = getMarkData();
		const rangeDays = $.derived(() => timeDays(start, end));
		const monthLabelHeight = $.derived(() => monthLabel ? cellSize : 0);
		const monthsPerRow = $.derived(() => monthsPerRowProp ?? Math.floor((ctx.width + (monthPadding - 1) * cellSize * DAYS_PER_WEEK) / (monthPadding * cellSize * DAYS_PER_WEEK)));
		const dataByDate = $.derived(() => ctx.data && ctx.config.x ? index(markData(), (d) => ctx.x(d)) : new Map());

		const allCells = $.derived(() => {
			const cells = [];
			const monthIndexMap = new Map();
			let currentMonthIndex = 0;

			rangeDays().forEach((day) => {
				const firstDayOfMonth = new Date(day.getFullYear(), day.getMonth(), 1);
				const monthKey = `${day.getFullYear()}-${day.getMonth()}`;

				if (!monthIndexMap.has(monthKey)) {
					monthIndexMap.set(monthKey, currentMonthIndex);
					currentMonthIndex++;
				}

				const monthIndex = monthIndexMap.get(monthKey);
				const cellData = dataByDate().get(day) ?? { date: day };
				const monthCol = monthIndex % monthsPerRow();
				const monthRow = Math.floor(monthIndex / monthsPerRow());
				const monthPaddingOffset = monthPadding * cellSize * DAYS_PER_WEEK * monthCol;
				const weekDiff = timeWeek.count(firstDayOfMonth, day);

				cells.push({
					x: day.getDay() * cellSize + monthPaddingOffset,
					y: weekDiff * cellSize + monthRow * cellSize * rowSpacing + monthLabelHeight(),
					color: ctx.config.c ? ctx.cGet(cellData) : 'transparent',
					data: cellData,
					date: day
				});
			});

			return { cells, monthIndexMap };
		});

		const monthLabels = $.derived(() => {
			const labels = [];
			const monthIndexMap = allCells().monthIndexMap;
			const monthEntries = Array.from(monthIndexMap.entries()).sort((a, b) => a[1] - b[1]);

			monthEntries.forEach(([monthKey, idx]) => {
				const [year, month] = monthKey.split('-').map(Number);
				const firstDayOfMonth = new Date(year, month, 1);
				const monthCol = idx % monthsPerRow();
				const monthRow = Math.floor(idx / monthsPerRow());
				const monthPaddingOffset = monthPadding * cellSize * DAYS_PER_WEEK * monthCol;

				labels.push({
					x: monthPaddingOffset,
					y: monthRow * cellSize * rowSpacing,
					text: format(firstDayOfMonth, 'month')
				});
			});

			return labels;
		});

		if (Group) {
			$$renderer.push('<!--[-->');

			Group($$renderer, {
				children: ($$renderer) => {
					if (children) {
						$$renderer.push('<!--[0-->');
						children($$renderer, { cells: allCells().cells, cellSize });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><!--[-->`);

						const each_array = $.ensure_array_like(allCells().cells);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let cell = each_array[$$index];

							if (Rect) {
								$$renderer.push('<!--[-->');

								Rect($$renderer, $.spread_props([
									{
										x: cell.x,
										y: cell.y,
										width: cellSize,
										height: cellSize,
										fill: cell.color,
										onpointermove: (e) => tooltip && ctx.tooltip?.show(e, cell.data),
										onpointerleave: () => tooltip && ctx.tooltip?.hide()
									},
									extractLayerProps(restProps, 'lc-month-cell')
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (showDayNumber) {
								$$renderer.push('<!--[0-->');

								if (Text) {
									$$renderer.push('<!--[-->');

									Text($$renderer, $.spread_props([
										{
											x: cell.x + cellSize / 2,
											y: cell.y + cellSize / 2,
											lineHeight: '0.8em',
											value: cell.date.getDate(),
											textAnchor: 'middle',
											verticalAnchor: 'middle',
											class: 'lc-month-day-number'
										},
										dayNumberProps
									]));

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]--> `);

					if (monthLabel) {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array_1 = $.ensure_array_like(monthLabels());

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let label = each_array_1[$$index_1];

							if (Text) {
								$$renderer.push('<!--[-->');

								Text($$renderer, $.spread_props([
									{
										x: label.x,
										y: label.y,
										value: label.text,
										verticalAnchor: 'start',
										class: 'lc-month-month-label'
									},
									extractLayerProps(monthLabel, 'lc-month-month-label')
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}