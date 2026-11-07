import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, Bars, Group, Labels, Text, Tooltip } from 'layerchart';
import { max, sum } from 'd3-array';
import { format } from '@layerstack/utils';
import { RangeField } from 'svelte-ux';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(` <span class="text-xs text-surface-content/50"> </span>`, 1);
var root_2 = $.from_html(`<div class="mb-4"><!></div> <!>`, 1);

export default function Series_horizontal_diverging_label_gap($$anchor, $$props) {
	$.push($$props, true);

	// Mock world population demographics data
	const data = [
		{ age: '0-4', male: 200, female: 190 },
		{ age: '5-9', male: 180, female: 175 },
		{ age: '10-14', male: 170, female: 165 },
		{ age: '15-19', male: 160, female: 155 },
		{ age: '20-24', male: 150, female: 145 },
		{ age: '25-29', male: 140, female: 135 },
		{ age: '30-34', male: 130, female: 125 },
		{ age: '35-39', male: 120, female: 115 },
		{ age: '40-44', male: 110, female: 105 },
		{ age: '45-49', male: 100, female: 95 },
		{ age: '50-54', male: 90, female: 85 },
		{ age: '55-59', male: 80, female: 75 },
		{ age: '60-64', male: 70, female: 65 },
		{ age: '65-69', male: 60, female: 55 },
		{ age: '70-74', male: 50, female: 45 },
		{ age: '75-79', male: 40, female: 35 },
		{ age: '80-84', male: 30, female: 25 },
		{ age: '85+', male: 20, female: 15 }
	];

	const totalPopulation = sum(data, (d) => d.male + d.female);
	const maxValue = max(data, (d) => Math.max(d.male, d.female)) ?? 0;
	const labelWidth = 32;
	let gap = $.state(50);
	var $$exports = { data };
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'Gap',
		min: 0,
		max: 200,
		get value() {
			return $.get(gap);
		},

		set value($$value) {
			$.set(gap, $$value, true);
		}
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			$.each(node_2, 17, () => context().series.visibleSeries, (s) => s.key, ($$anchor, s) => {
				{
					let $0 = $.derived(() => $.get(gap) / 2 * ($.get(s).key === 'male' ? -1 : 1));

					Group($$anchor, {
						get x() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							Bars(node_3, {
								get seriesKey() {
									return $.get(s).key;
								},
								rounded: 'edge',
								radius: 4,
								strokeWidth: 1
							});

							var node_4 = $.sibling(node_3, 2);

							Labels(node_4, {
								get seriesKey() {
									return $.get(s).key;
								},
								placement: 'outside',
								format: (v) => format(Math.abs(v), 'metric'),
								class: 'fill-surface-content/50 stroke-none'
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				}
			});

			var node_5 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => (context().yScale.bandwidth?.() ?? 0) / 2);

				Text(node_5, {
					get data() {
						return data;
					},
					x: () => 0,
					y: 'age',
					value: 'age',
					get dy() {
						return $.get($0);
					},
					textAnchor: 'middle',
					verticalAnchor: 'middle',
					fontSize: 12,
					class: 'font-medium fill-surface-content'
				});
			}

			$.append($$anchor, fragment_1);
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_4 = $.comment();
			var node_6 = $.first_child(fragment_4);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_5 = root();
					var node_7 = $.first_child(fragment_5);

					$.component(node_7, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(($0) => $.set_text(text, `Age: ${$0 ?? ''}`), [() => context().y(data())]);
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_8 = $.sibling(node_7, 2);

					$.component(node_8, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root();
								var node_9 = $.first_child(fragment_7);

								$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'male',
										color: 'var(--color-primary)',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_8 = root_1();
											var text_1 = $.first_child(fragment_8);
											var span = $.sibling(text_1);
											var text_2 = $.only_child(span);

											$.template_effect(
												($0, $1) => {
													$.set_text(text_1, `${$0 ?? ''} `);
													$.set_text(text_2, `(${$1 ?? ''})`);
												},
												[
													() => format(data().male),
													() => format(data().male / totalPopulation, 'percent')
												]
											);

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								var node_10 = $.sibling(node_9, 2);

								$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'female',
										color: 'var(--color-secondary)',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_9 = root_1();
											var text_3 = $.first_child(fragment_9);
											var span_1 = $.sibling(text_3);
											var text_4 = $.only_child(span_1);

											$.template_effect(
												($0, $1) => {
													$.set_text(text_3, `${$0 ?? ''} `);
													$.set_text(text_4, `(${$1 ?? ''})`);
												},
												[
													() => format(data().female),
													() => format(data().female / totalPopulation, 'percent')
												]
											);

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				};

				$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_4);
		};

		let $0 = $.derived(() => [-maxValue, maxValue]);
		let $1 = $.derived(() => [$.get(gap) / 2 + labelWidth, $.get(gap) / 2 + labelWidth]);

		BarChart(node_1, {
			get data() {
				return data;
			},
			y: 'age',
			orientation: 'horizontal',
			get xDomain() {
				return $.get($0);
			},
			xNice: false,
			axis: false,
			grid: false,
			get xPadding() {
				return $.get($1);
			},

			series: [
				{
					key: 'male',
					value: (d) => -d.male,
					color: 'var(--color-primary)'
				},

				{
					key: 'female',
					value: (d) => d.female,
					color: 'var(--color-secondary)'
				}
			],
			height: 600,
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}