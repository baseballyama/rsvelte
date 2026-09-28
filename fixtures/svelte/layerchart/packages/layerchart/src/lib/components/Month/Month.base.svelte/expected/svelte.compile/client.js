import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { timeDays, timeWeek } from 'd3-time';
import { index } from 'd3-array';
import { format } from '@layerstack/utils';
import '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getMarkData } from '$lib/contexts/facet.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Rect',
	'Group',
	'Text',
	'start',
	'end',
	'cellSize',
	'monthsPerRow',
	'monthPadding',
	'rowSpacing',
	'showDayNumber',
	'monthLabel',
	'dayNumberProps',
	'tooltip',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Month_base($$anchor, $$props) {
	$.push($$props, true);

	const DAYS_PER_WEEK = 7;

	let cellSize = $.prop($$props, 'cellSize', 3, 25),
		monthPadding = $.prop($$props, 'monthPadding', 3, 1.2),
		rowSpacing = $.prop($$props, 'rowSpacing', 3, 8),
		showDayNumber = $.prop($$props, 'showDayNumber', 3, true),
		monthLabel = $.prop($$props, 'monthLabel', 3, true),
		dayNumberProps = $.prop($$props, 'dayNumberProps', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	const ctx = getChartContext();
	const markData = getMarkData();
	const rangeDays = $.derived(() => timeDays($$props.start, $$props.end));
	const monthLabelHeight = $.derived(() => monthLabel() ? cellSize() : 0);
	const monthsPerRow = $.derived(() => $$props.monthsPerRow ?? Math.floor((ctx.width + (monthPadding() - 1) * cellSize() * DAYS_PER_WEEK) / (monthPadding() * cellSize() * DAYS_PER_WEEK)));
	const dataByDate = $.derived(() => ctx.data && ctx.config.x ? index(markData(), (d) => ctx.x(d)) : new Map());

	const allCells = $.derived(() => {
		const cells = [];
		const monthIndexMap = new Map();
		let currentMonthIndex = 0;

		$.get(rangeDays).forEach((day) => {
			const firstDayOfMonth = new Date(day.getFullYear(), day.getMonth(), 1);
			const monthKey = `${day.getFullYear()}-${day.getMonth()}`;

			if (!monthIndexMap.has(monthKey)) {
				monthIndexMap.set(monthKey, currentMonthIndex);
				currentMonthIndex++;
			}

			const monthIndex = monthIndexMap.get(monthKey);
			const cellData = $.get(dataByDate).get(day) ?? { date: day };
			const monthCol = monthIndex % $.get(monthsPerRow);
			const monthRow = Math.floor(monthIndex / $.get(monthsPerRow));
			const monthPaddingOffset = monthPadding() * cellSize() * DAYS_PER_WEEK * monthCol;
			const weekDiff = timeWeek.count(firstDayOfMonth, day);

			cells.push({
				x: day.getDay() * cellSize() + monthPaddingOffset,
				y: weekDiff * cellSize() + monthRow * cellSize() * rowSpacing() + $.get(monthLabelHeight),
				color: ctx.config.c ? ctx.cGet(cellData) : 'transparent',
				data: cellData,
				date: day
			});
		});

		return { cells, monthIndexMap };
	});

	const monthLabels = $.derived(() => {
		const labels = [];
		const monthIndexMap = $.get(allCells).monthIndexMap;
		const monthEntries = Array.from(monthIndexMap.entries()).sort((a, b) => a[1] - b[1]);

		monthEntries.forEach(([monthKey, idx]) => {
			const [year, month] = monthKey.split('-').map(Number);
			const firstDayOfMonth = new Date(year, month, 1);
			const monthCol = idx % $.get(monthsPerRow);
			const monthRow = Math.floor(idx / $.get(monthsPerRow));
			const monthPaddingOffset = monthPadding() * cellSize() * DAYS_PER_WEEK * monthCol;

			labels.push({
				x: monthPaddingOffset,
				y: monthRow * cellSize() * rowSpacing(),
				text: format(firstDayOfMonth, 'month')
			});
		});

		return labels;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $$props.Group, ($$anchor, Group_1) => {
		Group_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.snippet(node_2, () => $$props.children, () => ({ cells: $.get(allCells).cells, cellSize: cellSize() }));
						$.append($$anchor, fragment_2);
					};

					var alternate = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.each(node_3, 17, () => $.get(allCells).cells, $.index, ($$anchor, cell) => {
							var fragment_4 = root();
							var node_4 = $.first_child(fragment_4);

							{
								let $0 = $.derived(() => extractLayerProps(restProps, 'lc-month-cell'));

								$.component(node_4, () => $$props.Rect, ($$anchor, Rect_1) => {
									Rect_1($$anchor, $.spread_props(
										{
											get x() {
												return $.get(cell).x;
											},

											get y() {
												return $.get(cell).y;
											},

											get width() {
												return cellSize();
											},

											get height() {
												return cellSize();
											},

											get fill() {
												return $.get(cell).color;
											},
											onpointermove: (e) => $$props.tooltip && ctx.tooltip?.show(e, $.get(cell).data),
											onpointerleave: () => $$props.tooltip && ctx.tooltip?.hide()
										},
										() => $.get($0)
									));
								});
							}

							var node_5 = $.sibling(node_4, 2);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_5 = $.comment();
									var node_6 = $.first_child(fragment_5);

									{
										let $0 = $.derived(() => $.get(cell).x + cellSize() / 2);
										let $1 = $.derived(() => $.get(cell).y + cellSize() / 2);
										let $2 = $.derived(() => $.get(cell).date.getDate());

										$.component(node_6, () => $$props.Text, ($$anchor, Text_1) => {
											Text_1($$anchor, $.spread_props(
												{
													get x() {
														return $.get($0);
													},

													get y() {
														return $.get($1);
													},
													lineHeight: '0.8em',
													get value() {
														return $.get($2);
													},
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'lc-month-day-number'
												},
												dayNumberProps
											));
										});
									}

									$.append($$anchor, fragment_5);
								};

								$.if(node_5, ($$render) => {
									if (showDayNumber()) $$render(consequent_1);
								});
							}

							$.append($$anchor, fragment_4);
						});

						$.append($$anchor, fragment_3);
					};

					$.if(node_1, ($$render) => {
						if ($$props.children) $$render(consequent); else $$render(alternate, -1);
					});
				}

				var node_7 = $.sibling(node_1, 2);

				{
					var consequent_2 = ($$anchor) => {
						var fragment_6 = $.comment();
						var node_8 = $.first_child(fragment_6);

						$.each(node_8, 17, () => $.get(monthLabels), $.index, ($$anchor, label) => {
							var fragment_7 = $.comment();
							var node_9 = $.first_child(fragment_7);

							{
								let $0 = $.derived(() => extractLayerProps(monthLabel(), 'lc-month-month-label'));

								$.component(node_9, () => $$props.Text, ($$anchor, Text_2) => {
									Text_2($$anchor, $.spread_props(
										{
											get x() {
												return $.get(label).x;
											},

											get y() {
												return $.get(label).y;
											},

											get value() {
												return $.get(label).text;
											},
											verticalAnchor: 'start',
											class: 'lc-month-month-label'
										},
										() => $.get($0)
									));
								});
							}

							$.append($$anchor, fragment_7);
						});

						$.append($$anchor, fragment_6);
					};

					$.if(node_7, ($$render) => {
						if (monthLabel()) $$render(consequent_2);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}