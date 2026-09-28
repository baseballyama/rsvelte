import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cubicInOut } from 'svelte/easing';
import { scaleBand } from 'd3-scale';
import { Bars, Axis, Chart, Layer } from 'layerchart';
import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Horizontal_tween_on_mount($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	let show = $.state(void 0);
	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	ShowControl(node, {
		label: 'Show Bars',
		get show() {
			return $.get(show);
		},

		set show($$value) {
			$.set(show, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => scaleBand().padding(0.4));

		Chart(node_1, {
			get data() {
				return data;
			},
			x: 'value',
			xDomain: [0, null],
			xNice: true,
			y: 'date',
			get yScale() {
				return $.get($0);
			},
			padding: { left: 32, bottom: 20, right: 8 },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						Axis(node_2, { placement: 'bottom', grid: true, rule: true });

						var node_3 = $.sibling(node_2, 2);

						Axis(node_3, { placement: 'left', rule: true });

						var node_4 = $.sibling(node_3, 2);

						{
							var consequent = ($$anchor) => {
								{
									let $0 = $.derived(() => ({ type: 'tween', duration: 500, easing: cubicInOut }));

									Bars($$anchor, {
										get motion() {
											return $.get($0);
										},
										strokeWidth: 1,
										class: 'fill-primary'
									});
								}
							};

							$.if(node_4, ($$render) => {
								if ($.get(show)) $$render(consequent);
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

	$.append($$anchor, fragment);

	return $.pop($$exports);
}