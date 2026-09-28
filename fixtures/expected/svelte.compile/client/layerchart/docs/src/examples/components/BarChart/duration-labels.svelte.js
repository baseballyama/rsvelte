import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding, Tooltip } from 'layerchart';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
import { scaleTime } from 'd3-scale';
import { format } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Duration_labels($$anchor, $$props) {
	$.push($$props, true);

	let placement = $.state('inside');

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
	var fragment = root();
	var node = $.first_child(fragment);

	Field(node, {
		label: 'Placement',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				get value() {
					return $.get(placement);
				},

				set value($$value) {
					$.set(placement, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					ToggleOption(node_1, {
						value: 'inside',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Inside');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					ToggleOption(node_2, {
						value: 'outside',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Outside');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_3 = $.comment();
			var node_4 = $.first_child(fragment_3);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = root();
					var node_5 = $.first_child(fragment_4);

					$.component(node_5, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(($0) => $.set_text(text_2, $0), [() => format(context().y(data()))]);
								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					});

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_7 = $.first_child(fragment_6);

								$.component(node_7, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Start',
										get value() {
											return data().start;
										},
										format: 'day'
									});
								});

								var node_8 = $.sibling(node_7, 2);

								$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'End',
										get value() {
											return data().end;
										},
										format: 'day'
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				$.component(node_4, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_3);
		};

		let $0 = $.derived(scaleTime);

		let $1 = $.derived(() => ({
			placement: $.get(placement),
			format: { type: 'day', options: { variant: 'short' } },
			fill: $.get(placement) === 'inside' ? 'white' : undefined
		}));

		let $2 = $.derived(() => defaultChartPadding({ left: 30 }));

		BarChart(node_3, {
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
			get labels() {
				return $.get($1);
			},

			props: {
				xAxis: { format: 'month' },
				tooltip: { context: { mode: 'bounds' } }
			},

			get padding() {
				return $.get($2);
			},
			height: 400,
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}