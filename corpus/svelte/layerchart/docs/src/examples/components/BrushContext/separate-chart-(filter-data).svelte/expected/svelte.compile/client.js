import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';

import {
	Area,
	Axis,
	Chart,
	Layer,
	LinearGradient,
	defaultChartPadding
} from 'layerchart';

const data = await getAppleStock();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Separate_chart__filter_data_($$anchor, $$props) {
	$.push($$props, true);

	// The lower chart owns the brush; filter the upper chart's data by its selection
	let brushChart = $.state(void 0);

	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => data.filter((d) => $.get(brushChart)?.brush.contains({ x: d.date }) ?? true));
		let $1 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

		Chart(node, {
			get data() {
				return $.get($0);
			},
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			get padding() {
				return $.get($1);
			},
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Axis(node_1, {
							placement: 'left',
							grid: true,
							rule: true,
							motion: { type: 'tween', duration: 200 }
						});

						var node_2 = $.sibling(node_1, 2);

						Axis(node_2, { placement: 'bottom', rule: true });

						var node_3 = $.sibling(node_2, 2);

						{
							const children = ($$anchor, $$arg0) => {
								let gradient = () => ($$arg0?.()).gradient;

								Area($$anchor, {
									line: { class: 'stroke-2 stroke-primary' },
									get fill() {
										return gradient();
									},
									motion: { type: 'tween', duration: 200 }
								});
							};

							LinearGradient(node_3, {
								class: 'from-primary/50 to-primary/1',
								vertical: true,
								children,
								$$slots: { default: true }
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	var node_4 = $.sibling(node, 2);

	Chart(node_4, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		padding: { left: 16 },
		brush: true,
		height: 40,
		get context() {
			return $.get(brushChart);
		},

		set context($$value) {
			$.set(brushChart, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Area($$anchor, {
						line: { class: 'stroke-2 stroke-primary' },
						class: 'fill-primary/20'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}