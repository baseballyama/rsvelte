import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, BarChart, Polygon, Text, Tooltip } from 'layerchart';

export let tags = ['gauge'];

var root = $.from_html(`<!> <!>`, 1);

export default function Single_stack_with_indicator($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ label: 'Severe thinness', start: 15, end: 16 },
		{ label: 'Thinness', start: 16, end: 18.5 },
		{ label: 'Normal', start: 18.5, end: 25 },
		{ label: 'Overweight', start: 25, end: 30 },
		{ label: 'Obese', start: 30, end: 35 },
		{ label: 'Severe obese', start: 35, end: 40 }
	];

	var $$exports = { data };

	{
		const axis = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			{
				const tickLabel = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					{
						let $0 = $.derived(() => props().value === '40' ? 'end' : 'start');

						Text($$anchor, $.spread_props(props, {
							get textAnchor() {
								return $.get($0);
							}
						}));
					}
				};

				Axis($$anchor, {
					placement: 'bottom',
					tickLength: 0,
					ticks: [15, 16, 18.5, 25, 30, 35, 40],
					tickLabel,
					$$slots: { tickLabel: true }
				});
			}
		};

		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			{
				let $0 = $.derived(() => context().xScale(26.5));

				Polygon($$anchor, {
					get cx() {
						return $.get($0);
					},
					cy: -3,
					r: 6,
					points: 3,
					rotate: 90,
					class: 'fill-black stroke-white dark:fill-white dark:stroke-black'
				});
			}
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_4 = $.comment();
			var node = $.first_child(fragment_4);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_5 = $.comment();
					var node_1 = $.first_child(fragment_5);

					$.component(node_1, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_2 = $.first_child(fragment_6);

								$.component(node_2, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Label:',
										get value() {
											return data().label;
										}
									});
								});

								var node_3 = $.sibling(node_2, 2);

								$.component(node_3, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'Range:',
										get value() {
											return `${data().start ?? ''} - ${data().end ?? ''}`;
										}
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				};

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_4);
		};

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: ['start', 'end'],
			y: (d) => 1,
			xBaseline: null,
			xNice: false,
			c: 'label',
			cRange: [
				'var(--color-blue-500)',
				'var(--color-blue-400)',
				'var(--color-teal-500)',
				'var(--color-yellow-500)',
				'var(--color-orange-500)',
				'var(--color-red-500)'
			],
			bandPadding: 0,
			padding: { top: 12, bottom: 12 },
			orientation: 'horizontal',
			props: { tooltip: { context: { mode: 'bounds' } } },
			height: 40,
			axis,
			aboveMarks,
			tooltip,
			$$slots: { axis: true, aboveMarks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}