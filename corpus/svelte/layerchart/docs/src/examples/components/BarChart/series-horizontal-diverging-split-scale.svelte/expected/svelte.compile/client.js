import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Rect, Text, Tooltip } from 'layerchart';
import { scaleBand, scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import { format } from '@layerstack/utils';
import { RangeField } from 'svelte-ux';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="mb-4"><!></div> <!>`, 1);

export default function Series_horizontal_diverging_split_scale($$anchor, $$props) {
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

	// Shared max so both sides use the same scale and remain comparable
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
			const mid = $.derived(() => context().width / 2);
			const xMale = $.derived(() => scaleLinear().domain([0, maxValue]).range([$.get(mid) - $.get(gap) / 2, labelWidth]));
			const xFemale = $.derived(() => scaleLinear().domain([0, maxValue]).range([$.get(mid) + $.get(gap) / 2, context().width - labelWidth]));
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.each(node_2, 17, () => data, (d) => d.age, ($$anchor, d) => {
				const y = $.derived(() => context().yScale($.get(d).age));
				const h = $.derived(() => context().yScale.bandwidth?.() ?? 0);
				var fragment_2 = root();
				var node_3 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => $.get(xMale)($.get(d).male));
					let $1 = $.derived(() => $.get(xMale)(0) - $.get(xMale)($.get(d).male));

					Rect(node_3, {
						get x() {
							return $.get($0);
						},

						get y() {
							return $.get(y);
						},

						get width() {
							return $.get($1);
						},

						get height() {
							return $.get(h);
						},
						corners: [4, 0, 0, 4],
						fill: 'var(--color-primary)'
					});
				}

				var node_4 = $.sibling(node_3, 2);

				{
					let $0 = $.derived(() => $.get(xMale)($.get(d).male) - 4);
					let $1 = $.derived(() => $.get(y) + $.get(h) / 2);
					let $2 = $.derived(() => format($.get(d).male, 'metric'));

					Text(node_4, {
						get x() {
							return $.get($0);
						},

						get y() {
							return $.get($1);
						},

						get value() {
							return $.get($2);
						},
						textAnchor: 'end',
						verticalAnchor: 'middle',
						fontSize: 12,
						class: 'fill-surface-content/50'
					});
				}

				var node_5 = $.sibling(node_4, 2);

				{
					let $0 = $.derived(() => $.get(xFemale)(0));
					let $1 = $.derived(() => $.get(xFemale)($.get(d).female) - $.get(xFemale)(0));

					Rect(node_5, {
						get x() {
							return $.get($0);
						},

						get y() {
							return $.get(y);
						},

						get width() {
							return $.get($1);
						},

						get height() {
							return $.get(h);
						},
						corners: [0, 4, 4, 0],
						fill: 'var(--color-secondary)'
					});
				}

				var node_6 = $.sibling(node_5, 2);

				{
					let $0 = $.derived(() => $.get(xFemale)($.get(d).female) + 4);
					let $1 = $.derived(() => $.get(y) + $.get(h) / 2);
					let $2 = $.derived(() => format($.get(d).female, 'metric'));

					Text(node_6, {
						get x() {
							return $.get($0);
						},

						get y() {
							return $.get($1);
						},

						get value() {
							return $.get($2);
						},
						textAnchor: 'start',
						verticalAnchor: 'middle',
						fontSize: 12,
						class: 'fill-surface-content/50'
					});
				}

				var node_7 = $.sibling(node_6, 2);

				{
					let $0 = $.derived(() => $.get(y) + $.get(h) / 2);

					Text(node_7, {
						get x() {
							return $.get(mid);
						},

						get y() {
							return $.get($0);
						},

						get value() {
							return $.get(d).age;
						},
						textAnchor: 'middle',
						verticalAnchor: 'middle',
						fontSize: 12,
						class: 'font-medium fill-surface-content'
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		const tooltip = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_8 = $.first_child(fragment_3);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = root_1();
					var node_9 = $.first_child(fragment_4);

					$.component(node_9, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, `Age: ${data().age ?? ''}`));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_10 = $.sibling(node_9, 2);

					$.component(node_10, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_11 = $.first_child(fragment_6);

								$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'male',
										color: 'var(--color-primary)',
										get value() {
											return data().male;
										}
									});
								});

								var node_12 = $.sibling(node_11, 2);

								$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'female',
										color: 'var(--color-secondary)',
										get value() {
											return data().female;
										}
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_3);
		};

		let $0 = $.derived(() => scaleBand().padding(0.4));
		let $1 = $.derived(() => data.map((d) => d.age));

		Chart(node_1, {
			get data() {
				return data;
			},
			x: () => 0,
			y: 'age',
			get yScale() {
				return $.get($0);
			},

			get yDomain() {
				return $.get($1);
			},
			axis: false,
			grid: false,
			tooltipContext: { mode: 'band' },
			highlight: { area: { class: 'fill-surface-content/10' } },
			height: 600,
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}