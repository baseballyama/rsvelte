import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding, Tooltip } from 'layerchart';
import { scaleTime } from 'd3-scale';
import { format } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Duration($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{
			category: 'One',
			start: new Date('2021-01-01'),
			end: new Date('2021-03-01')
		},

		{
			category: 'One',
			start: new Date('2021-04-01'),
			end: new Date('2021-08-15')
		},

		{
			category: 'Two',
			start: new Date('2021-03-01'),
			end: new Date('2021-06-01')
		},

		{
			category: 'Two',
			start: new Date('2021-08-01'),
			end: new Date('2021-10-01')
		},

		{
			category: 'Three',
			start: new Date('2021-02-01'),
			end: new Date('2021-07-01')
		},

		{
			category: 'Four',
			start: new Date('2021-06-09'),
			end: new Date('2021-09-01')
		},

		{
			category: 'Four',
			start: new Date('2021-10-01'),
			end: new Date('2021-12-15')
		},

		{
			category: 'Five',
			start: new Date('2021-02-01'),
			end: new Date('2021-04-15')
		},

		{
			category: 'Five',
			start: new Date('2021-10-01'),
			end: new Date('2021-12-31')
		}
	];

	var $$exports = { data };

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(($0) => $.set_text(text, $0), [() => format(context().y(data()))]);
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_3 = $.first_child(fragment_4);

								$.component(node_3, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Start',
										get value() {
											return data().start;
										},
										format: 'day'
									});
								});

								var node_4 = $.sibling(node_3, 2);

								$.component(node_4, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'End',
										get value() {
											return data().end;
										},
										format: 'day'
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(scaleTime);
		let $1 = $.derived(() => defaultChartPadding({ left: 30 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: ['start', 'end'],
			get xScale() {
				return $.get($0);
			},
			y: 'category',
			xBaseline: undefined,
			xNice: false,
			c: 'category',
			cRange: [
				'var(--color-success)',
				'var(--color-danger)',
				'var(--color-warning)',
				'var(--color-info)',
				'var(--color-secondary)'
			],
			grid: { y: true, bandAlign: 'between' },
			orientation: 'horizontal',
			props: {
				xAxis: { format: 'month' },
				tooltip: { context: { mode: 'bounds' } }
			},

			get padding() {
				return $.get($1);
			},
			height: 400,
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	return $.pop($$exports);
}