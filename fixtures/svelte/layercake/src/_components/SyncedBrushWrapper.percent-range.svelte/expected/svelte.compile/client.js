import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, ScaledSvg, Html } from 'layercake';
import Line from './Line.svelte';
import Area from './Area.svelte';
import AxisX from './AxisX.percent-range.html.svelte';
import AxisY from './AxisY.percent-range.html.svelte';
import Brush from './Brush.html.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-wrapper svelte-1xih10n"><div class="chart-container svelte-1xih10n"><!></div> <div class="brush-container svelte-1xih10n"><!></div></div>`);

export default function SyncedBrushWrapper_percent_range($$anchor, $$props) {
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

	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	LayerCake(node, {
		ssr: true,
		percentRange: true,
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
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Html(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					AxisX(node_2, {
						ticks: (ticks) => {
							const filtered = ticks.filter((t) => t % 1 === 0);

							if (filtered.length > 7) {
								return filtered.filter((t, i) => i % 2 === 0);
							}

							return filtered;
						}
					});

					var node_3 = $.sibling(node_2, 2);

					AxisY(node_3, { ticks: 2 });
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			ScaledSvg(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_5 = $.first_child(fragment_2);

					Line(node_5, {
						get stroke() {
							return stroke();
						}
					});

					var node_6 = $.sibling(node_5, 2);

					{
						let $0 = $.derived(() => `${stroke()}10`);

						Area(node_6, {
							get fill() {
								return $.get($0);
							}
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_7 = $.child(div_2);

	LayerCake(node_7, {
		ssr: true,
		percentRange: true,
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
			var fragment_3 = root();
			var node_8 = $.first_child(fragment_3);

			ScaledSvg(node_8, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_9 = $.first_child(fragment_4);

					Line(node_9, {
						get stroke() {
							return stroke();
						}
					});

					var node_10 = $.sibling(node_9, 2);

					{
						let $0 = $.derived(() => `${stroke()}10`);

						Area(node_10, {
							get fill() {
								return $.get($0);
							}
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_8, 2);

			Html(node_11, {
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

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}