import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, Html } from 'layercake';
import Line from './Line.svelte';
import Area from './Area.svelte';
import AxisX from './AxisX.svelte';
import AxisY from './AxisY.svelte';
import Brush from './Brush.html.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="chart-wrapper svelte-13ntwi4"><div class="chart-container svelte-13ntwi4"><!></div> <div class="brush-container svelte-13ntwi4"><!></div></div>`);

export default function SyncedBrushWrapper($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {any} [min]
	 * @property {any} [max]
	 * @property {string} [xKey]
	 * @property {string} [yKey]
	 * @property {any} [data]
	 * @property {string} [stroke]
	 */
	/** @type {Props} */
	let min = $.prop($$props, 'min', 15, null),
		max = $.prop($$props, 'max', 15, null),
		xKey = $.prop($$props, 'xKey', 3, 'x'),
		yKey = $.prop($$props, 'yKey', 3, 'y'),
		data = $.prop($$props, 'data', 19, () => []),
		stroke = $.prop($$props, 'stroke', 3, '#00e047');

	let brushedData = $.derived(() => {
		const start = Math.max(0, Math.floor((min() ?? 0) * data().length));
		const end = Math.min(data().length, Math.ceil((max() ?? 1) * data().length));
		let brushed = data().slice(start, end);

		if (brushed.length < 2 && data().length >= 2) {
			return data().slice(start, start + 2);
		}

		return brushed;
	});

	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	LayerCake(node, {
		padding: { bottom: 20, left: 25 },
		get x() {
			return xKey();
		},

		get y() {
			return yKey();
		},
		yDomain: [0, null],
		get data() {
			return $.get(brushedData);
		},

		children: ($$anchor, $$slotProps) => {
			Svg($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					AxisX(node_1, {
						ticks: (ticks) => {
							const filtered = ticks.filter((t) => t % 1 === 0);

							if (filtered.length > 7) {
								return filtered.filter((t, i) => i % 2 === 0);
							}

							return filtered;
						}
					});

					var node_2 = $.sibling(node_1, 2);

					AxisY(node_2, { ticks: 2 });

					var node_3 = $.sibling(node_2, 2);

					Line(node_3, {
						get stroke() {
							return stroke();
						}
					});

					var node_4 = $.sibling(node_3, 2);

					{
						let $0 = $.derived(() => `${stroke()}10`);

						Area(node_4, {
							get fill() {
								return $.get($0);
							}
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_5 = $.child(div_2);

	LayerCake(node_5, {
		padding: { top: 5 },
		get x() {
			return xKey();
		},

		get y() {
			return yKey();
		},
		yDomain: [0, null],
		get data() {
			return data();
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_6 = $.first_child(fragment_2);

			Svg(node_6, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_7 = $.first_child(fragment_3);

					Line(node_7, {
						get stroke() {
							return stroke();
						}
					});

					var node_8 = $.sibling(node_7, 2);

					{
						let $0 = $.derived(() => `${stroke()}10`);

						Area(node_8, {
							get fill() {
								return $.get($0);
							}
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_6, 2);

			Html(node_9, {
				children: ($$anchor, $$slotProps) => {
					Brush($$anchor, {
						get min() {
							return min();
						},

						set min($$value) {
							min($$value);
						},

						get max() {
							return max();
						},

						set max($$value) {
							max($$value);
						}
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}