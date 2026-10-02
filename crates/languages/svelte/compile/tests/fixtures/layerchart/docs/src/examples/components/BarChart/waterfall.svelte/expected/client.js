import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding, Line, Text, Tooltip } from 'layerchart';
import { format } from '@layerstack/utils';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Waterfall($$anchor, $$props) {
	$.push($$props, true);

	const rawData = [
		{ label: 'Product Revenue', value: 420000 },
		{ label: 'Services Revenue', value: 210000 },
		{ label: 'Fixed Costs', value: -170000 },
		{ label: 'Variable Costs', value: -140000 }
	];

	let runningTotal = 0;

	const items = rawData.map((d) => {
		const start = runningTotal;

		runningTotal += d.value;

		return {
			...d,
			start,
			end: runningTotal,
			type: d.value >= 0 ? 'increase' : 'decrease'
		};
	});

	const data = [
		...items,
		{
			label: 'Total',
			value: runningTotal,
			start: 0,
			end: runningTotal,
			type: 'total'
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
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().label));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_3 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										var fragment_5 = $.comment();
										var node_4 = $.first_child(fragment_5);

										$.component(node_4, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
											Tooltip_Item($$anchor, {
												label: 'Value',
												get value() {
													return data().end;
												},
												format: 'currencyRound',
												valueAlign: 'right'
											});
										});

										$.append($$anchor, fragment_5);
									};

									var alternate = ($$anchor) => {
										var fragment_6 = root();
										var node_5 = $.first_child(fragment_6);

										$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
											Tooltip_Item_1($$anchor, {
												label: 'Start',
												get value() {
													return data().start;
												},
												format: 'currencyRound',
												valueAlign: 'right'
											});
										});

										var node_6 = $.sibling(node_5, 2);

										{
											let $0 = $.derived(() => data().value >= 0 ? '+' : '');
											let $1 = $.derived(() => format(data().value, 'currencyRound'));

											$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
												Tooltip_Item_2($$anchor, {
													label: 'Change',
													get value() {
														return `${$.get($0) ?? ''}${$.get($1) ?? ''}`;
													},
													valueAlign: 'right'
												});
											});
										}

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
											Tooltip_Item_3($$anchor, {
												label: 'End',
												get value() {
													return data().end;
												},
												format: 'currencyRound',
												valueAlign: 'right'
											});
										});

										$.append($$anchor, fragment_6);
									};

									$.if(node_3, ($$render) => {
										if (data().type === 'total' || data().start === 0) $$render(consequent); else $$render(alternate, -1);
									});
								}

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

		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_7 = $.comment();
			var node_8 = $.first_child(fragment_7);

			$.each(node_8, 19, () => data, (d) => d.label, ($$anchor, d, i) => {
				const bandLeft = $.derived(() => context().xScale($.get(d).label));
				const bandCenter = $.derived(() => $.get(bandLeft) + context().xScale.bandwidth() / 2);
				const bandRight = $.derived(() => $.get(bandLeft) + context().xScale.bandwidth());
				const isNegative = $.derived(() => $.get(d).value < 0);
				var fragment_8 = root_1();
				var node_9 = $.first_child(fragment_8);

				{
					var consequent_1 = ($$anchor) => {
						{
							let $0 = $.derived(() => context().xScale(data[$.get(i) + 1].label));
							let $1 = $.derived(() => context().yScale($.get(d).end));
							let $2 = $.derived(() => context().yScale($.get(d).end));

							Line($$anchor, {
								get x1() {
									return $.get(bandRight);
								},

								get x2() {
									return $.get($0);
								},

								get y1() {
									return $.get($1);
								},

								get y2() {
									return $.get($2);
								},
								stroke: 'currentColor',
								dashArray: [4, 3],
								strokeWidth: 1,
								opacity: 0.3
							});
						}
					};

					$.if(node_9, ($$render) => {
						if ($.get(i) < data.length - 1) $$render(consequent_1);
					});
				}

				var node_10 = $.sibling(node_9, 2);

				{
					let $0 = $.derived(() => context().yScale($.get(d).end));
					let $1 = $.derived(() => 2 * ($.get(isNegative) ? 1 : -1));
					let $2 = $.derived(() => $.get(isNegative) ? 'start' : 'end');
					let $3 = $.derived(() => format($.get(d).value, 'metric'));

					Text(node_10, {
						get x() {
							return $.get(bandCenter);
						},

						get y() {
							return $.get($0);
						},

						get dy() {
							return $.get($1);
						},

						get verticalAnchor() {
							return $.get($2);
						},
						textAnchor: 'middle',
						class: 'text-xs fill-current',
						get value() {
							return $.get($3);
						}
					});
				}

				$.append($$anchor, fragment_8);
			});

			$.append($$anchor, fragment_7);
		};

		let $0 = $.derived(() => defaultChartPadding({ top: 24 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'label',
			y: ['start', 'end'],
			yDomain: [0, null],
			yNice: true,
			c: 'type',
			cDomain: ['increase', 'decrease', 'total'],
			cRange: [
				'var(--color-success)',
				'var(--color-danger)',
				'var(--color-info)'
			],
			bandPadding: 0.3,
			labels: false,
			rule: true,
			props: {
				yAxis: { format: 'metric' },
				bars: { rounded: 'all', radius: 2, strokeWidth: 0 }
			},

			get padding() {
				return $.get($0);
			},
			height: 300,
			tooltip,
			aboveMarks,
			$$slots: { tooltip: true, aboveMarks: true }
		});
	}

	return $.pop($$exports);
}