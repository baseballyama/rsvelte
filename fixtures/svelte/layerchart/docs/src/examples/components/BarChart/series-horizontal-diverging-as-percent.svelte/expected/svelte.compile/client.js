import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, Tooltip, accessor, defaultChartPadding } from 'layerchart';
import { sum } from 'd3-array';
import { format } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Series_horizontal_diverging_as_percent($$anchor, $$props) {
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

								$.template_effect(($0) => $.set_text(text, `Age: ${$0 ?? ''}`), [() => format(context().y(data()))]);
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

								$.each(node_3, 17, () => context().series.series, $.index, ($$anchor, s) => {
									const valueAccessor = $.derived(() => accessor($.get(s).value ?? $.get(s).key));
									const value = $.derived(() => Math.abs($.get(valueAccessor)(data())));
									var fragment_5 = $.comment();
									var node_4 = $.first_child(fragment_5);

									$.component(node_4, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											get label() {
												return $.get(s).key;
											},

											get color() {
												return $.get(s).color;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(($0) => $.set_text(text_1, $0), [() => format($.get(value), 'percent')]);
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
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

		let $0 = $.derived(() => defaultChartPadding({ left: 32, right: 10 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			y: 'age',
			orientation: 'horizontal',
			get padding() {
				return $.get($0);
			},
			xPadding: [50, 50],
			labels: { format: (value) => format(Math.abs(value), 'percent') },
			props: {
				xAxis: { format: (value) => format(Math.abs(value), 'percentRound') }
			},
			series: [
				{
					key: 'male',
					value: (d) => -d.male / totalPopulation,
					color: 'var(--color-primary)'
				},

				{
					key: 'female',
					value: (d) => d.female / totalPopulation,
					color: 'var(--color-secondary)'
				}
			],
			height: 600,
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	return $.pop($$exports);
}