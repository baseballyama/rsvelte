import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import { Axis, Bar, Chart, Layer } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { cubicInOut } from 'svelte/easing';
import ShowControls from '$lib/components/controls/fields/ShowField.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Vertical_stagger_tween_on_mount_rounded_edge($$anchor, $$props) {
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
								var fragment_3 = $.comment();
								var node_5 = $.first_child(fragment_3);

								$.each(node_5, 17, () => data, $.index, ($$anchor, d, i) => {
									{
										let $0 = $.derived(() => ({
											type: 'tween',
											duration: 500,
											easing: cubicInOut,
											delay: i * 30
										}));

										Bar($$anchor, {
											get data() {
												return $.get(d);
											},

											get motion() {
												return $.get($0);
											},
											radius: 4,
											rounded: 'edge',
											strokeWidth: 1,
											class: 'fill-primary'
										});
									}
								});

								$.append($$anchor, fragment_3);
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