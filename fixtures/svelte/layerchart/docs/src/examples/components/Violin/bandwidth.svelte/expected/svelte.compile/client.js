import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import { Axis, Chart, Layer, Violin } from 'layerchart';
import { RangeField } from 'svelte-ux';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="mb-4"><!></div> <!>`, 1);

export default function Bandwidth($$anchor, $$props) {
	$.push($$props, true);

	let bandwidth = $.state(5);

	const data = [
		{
			group: 'Tight',
			values: [
				28,
				29,
				30,
				30,
				30,
				31,
				31,
				31,
				32,
				32,
				32,
				32,
				33,
				33,
				33,
				33,
				33,
				34,
				34,
				34,
				34,
				35,
				35,
				35,
				36,
				36,
				37,
				38
			]
		},

		{
			group: 'Normal',
			values: [
				10,
				15,
				18,
				20,
				22,
				25,
				28,
				30,
				32,
				35,
				37,
				40,
				42,
				45,
				48,
				50,
				55,
				58,
				60,
				62,
				65,
				68,
				70,
				75,
				78,
				80,
				85,
				90
			]
		},

		{
			group: 'Bimodal',
			values: [
				5,
				8,
				10,
				12,
				14,
				15,
				16,
				18,
				20,
				22,
				24,
				25,
				55,
				58,
				60,
				62,
				64,
				65,
				68,
				70,
				72,
				75,
				78,
				80,
				82,
				85,
				88,
				90
			]
		},

		{
			group: 'Skewed',
			values: [
				5,
				5,
				8,
				8,
				10,
				10,
				10,
				12,
				12,
				15,
				15,
				15,
				18,
				18,
				20,
				22,
				25,
				28,
				30,
				35,
				40,
				45,
				55,
				65,
				75,
				85,
				90,
				95
			]
		}
	];

	var $$exports = { data };
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'Bandwidth',
		min: 1,
		max: 20,
		step: 0.5,
		get value() {
			return $.get(bandwidth);
		},

		set value($$value) {
			$.set(bandwidth, $$value, true);
		}
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => scaleBand().padding(0.1));

		Chart(node_1, {
			get data() {
				return data;
			},
			x: 'group',
			get xScale() {
				return $.get($0);
			},
			yDomain: [0, 100],
			yNice: true,
			padding: { left: 24, bottom: 20, top: 8 },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						Axis(node_2, { placement: 'left', grid: true, rule: true });

						var node_3 = $.sibling(node_2, 2);

						Axis(node_3, { placement: 'bottom', rule: true });

						var node_4 = $.sibling(node_3, 2);

						$.each(node_4, 17, () => data, $.index, ($$anchor, item) => {
							Violin($$anchor, {
								get data() {
									return $.get(item);
								},
								values: 'values',
								get bandwidth() {
									return $.get(bandwidth);
								},
								box: true,
								median: true,
								class: 'fill-primary/20 stroke-primary'
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}