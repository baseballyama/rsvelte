import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cubicInOut } from 'svelte/easing';
import { scaleBand } from 'd3-scale';
import { Axis, Bars, Chart, Layer } from 'layerchart';
import ShowControls from '$lib/components/controls/fields/ShowField.svelte';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Vertical_tween_on_mount($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 20, min: 20, max: 100 });
	let show = $.state(void 0);
	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	ShowControls(node, {
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
			x: 'date',
			get xScale() {
				return $.get($0);
			},
			y: 'value',
			yDomain: [0, null],
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