import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import { Axis, Chart, Layer, Violin } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Basic($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{
			group: 'A',
			values: [
				2,
				5,
				7,
				8,
				10,
				12,
				14,
				15,
				16,
				18,
				20,
				21,
				22,
				24,
				25,
				26,
				28,
				30,
				30,
				32,
				33,
				35,
				36,
				38,
				40,
				40,
				42,
				44,
				45,
				48,
				50,
				52,
				55,
				58,
				60,
				65,
				70,
				80
			]
		},

		{
			group: 'B',
			values: [
				15,
				18,
				20,
				22,
				24,
				25,
				26,
				28,
				28,
				30,
				30,
				32,
				32,
				34,
				35,
				35,
				36,
				38,
				38,
				40,
				40,
				42,
				42,
				44,
				45,
				45,
				46,
				48,
				50,
				52,
				54,
				55,
				58,
				60,
				62,
				65
			]
		},

		{
			group: 'C',
			values: [
				5,
				10,
				12,
				15,
				18,
				20,
				20,
				22,
				22,
				24,
				25,
				25,
				26,
				28,
				28,
				30,
				30,
				30,
				32,
				32,
				34,
				35,
				35,
				38,
				40,
				42,
				45,
				48,
				50,
				55,
				60,
				65,
				70,
				72,
				75,
				78
			]
		},

		{
			group: 'D',
			values: [
				20,
				25,
				28,
				30,
				32,
				34,
				35,
				36,
				38,
				38,
				40,
				40,
				42,
				42,
				44,
				44,
				45,
				45,
				46,
				48,
				48,
				50,
				50,
				52,
				52,
				54,
				55,
				56,
				58,
				60,
				62,
				64,
				65,
				68,
				70,
				75
			]
		}
	];

	var $$exports = { data };

	{
		let $0 = $.derived(() => scaleBand().padding(0.1));

		Chart($$anchor, {
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
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'left', grid: true, rule: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'bottom', rule: true });

						var node_2 = $.sibling(node_1, 2);

						$.each(node_2, 17, () => data, $.index, ($$anchor, item) => {
							Violin($$anchor, {
								get data() {
									return $.get(item);
								},
								values: 'values',
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

	return $.pop($$exports);
}