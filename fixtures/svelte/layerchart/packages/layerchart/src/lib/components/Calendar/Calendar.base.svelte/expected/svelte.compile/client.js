import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { timeDays, timeMonths, timeWeek } from 'd3-time';
import { index } from 'd3-array';
import { format } from '@layerstack/utils';
import MonthPath from '../MonthPath.svelte';
import '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getMarkData } from '$lib/contexts/facet.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Rect',
	'Text',
	'end',
	'start',
	'cellSize',
	'monthPath',
	'monthLabel',
	'tooltip',
	'children'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Calendar_base($$anchor, $$props) {
	$.push($$props, true);

	// MonthPath isn't split — only used here when `monthPath` is set.
	let monthPath = $.prop($$props, 'monthPath', 3, false),
		monthLabel = $.prop($$props, 'monthLabel', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	const ctx = getChartContext();
	const markData = getMarkData();
	const yearDays = $.derived(() => timeDays($$props.start, $$props.end));
	const yearMonths = $.derived(() => timeMonths($$props.start, $$props.end));
	const yearWeeks = $.derived(() => timeWeek.count($$props.start, $$props.end));
	const chartCellWidth = $.derived(() => ctx.width / ($.get(yearWeeks) + 1));
	const chartCellHeight = $.derived(() => ctx.height / 7);
	const chartCellSize = $.derived(() => Math.min($.get(chartCellWidth), $.get(chartCellHeight)));

	const cellSize = $.derived(() => Array.isArray($$props.cellSize)
		? $$props.cellSize
		: typeof $$props.cellSize === 'number'
			? [$$props.cellSize, $$props.cellSize]
			: [$.get(chartCellSize), $.get(chartCellSize)]);

	const dataByDate = $.derived(() => ctx.data && ctx.config.x ? index(markData(), (d) => ctx.x(d)) : new Map());

	const cells = $.derived(() => $.get(yearDays).map((date) => {
		const cellData = $.get(dataByDate).get(date) ?? { date };

		return {
			x: timeWeek.count($$props.start, date) * $.get(cellSize)[0],
			y: date.getDay() * $.get(cellSize)[1],
			color: ctx.config.c ? ctx.cGet(cellData) : 'transparent',
			data: cellData
		};
	}));

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children, () => ({ cells: $.get(cells), cellSize: $.get(cellSize) }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.each(node_2, 17, () => $.get(cells), $.index, ($$anchor, cell) => {
				var fragment_3 = $.comment();
				var node_3 = $.first_child(fragment_3);

				{
					let $0 = $.derived(() => extractLayerProps(restProps, 'lc-calendar-cell'));

					$.component(node_3, () => $$props.Rect, ($$anchor, Rect_1) => {
						Rect_1($$anchor, $.spread_props(
							{
								get x() {
									return $.get(cell).x;
								},

								get y() {
									return $.get(cell).y;
								},

								get width() {
									return $.get(cellSize)[0];
								},

								get height() {
									return $.get(cellSize)[1];
								},

								get fill() {
									return $.get(cell).color;
								},
								onpointermove: (e) => $$props.tooltip && ctx.tooltip?.show(e, $.get(cell).data),
								onpointerleave: () => $$props.tooltip && ctx.tooltip?.hide(),
								strokeWidth: 1
							},
							() => $.get($0)
						));
					});
				}

				$.append($$anchor, fragment_3);
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_4 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_5 = $.first_child(fragment_4);

			$.each(node_5, 17, () => $.get(yearMonths), $.index, ($$anchor, date) => {
				{
					let $0 = $.derived(() => extractLayerProps(monthPath(), 'lc-calendar-month-path'));

					MonthPath($$anchor, $.spread_props(
						{
							get date() {
								return $.get(date);
							},

							get startOfRange() {
								return $$props.start;
							},

							get cellSize() {
								return $.get(cellSize);
							}
						},
						() => $.get($0)
					));
				}
			});

			$.append($$anchor, fragment_4);
		};

		$.if(node_4, ($$render) => {
			if (monthPath()) $$render(consequent_1);
		});
	}

	var node_6 = $.sibling(node_4, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_7 = $.first_child(fragment_6);

			$.each(node_7, 17, () => $.get(yearMonths), $.index, ($$anchor, date) => {
				var fragment_7 = $.comment();
				var node_8 = $.first_child(fragment_7);

				{
					let $0 = $.derived(() => timeWeek.count($$props.start, timeWeek.ceil($.get(date))) * $.get(cellSize)[0]);
					let $1 = $.derived(() => format($.get(date), 'month', { variant: 'short' }));
					let $2 = $.derived(() => extractLayerProps(monthLabel(), 'lc-calendar-month-label'));

					$.component(node_8, () => $$props.Text, ($$anchor, Text_1) => {
						Text_1($$anchor, $.spread_props(
							{
								get x() {
									return $.get($0);
								},

								get value() {
									return $.get($1);
								},
								capHeight: '7px'
							},
							() => $.get($2)
						));
					});
				}

				$.append($$anchor, fragment_7);
			});

			$.append($$anchor, fragment_6);
		};

		$.if(node_6, ($$render) => {
			if (monthLabel()) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}