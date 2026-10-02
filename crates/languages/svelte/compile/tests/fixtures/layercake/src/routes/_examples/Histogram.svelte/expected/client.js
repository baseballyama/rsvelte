import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, bin, takeEvery } from 'layercake';
import { extent } from 'd3-array';
import { scaleBand } from 'd3-scale';
import { format } from 'd3-format';
import Column from '../../_components/Column.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import calcThresholds from '../../_modules/calcThresholds.js';
import data from '../../_data/unemployment.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="input-container" style="position: absolute;right:10px;z-index: 9;"><input style="margin:0;" type="range" min="4" max="100" step="4" class="svelte-tflt1t"/> <span class="counter-container" style="display:inline-block;vertical-align:top;width: 70px;text-align:right;"> </span></div> <div class="chart-container svelte-tflt1t"><!></div>`, 1);

export default function Histogram($$anchor, $$props) {
	$.push($$props, true);

	const f = format('.2f');
	const xKey = ['x0', 'x1'];
	const yKey = 'length';
	let binCount = $.state(40);
	const domain = extent(data);
	let thresholds = $.derived(() => calcThresholds(domain, $.get(binCount)));
	let slimThresholds = $.derived(() => takeEvery($.get(thresholds), 5));
	let binnedData = $.derived(() => bin(data, (d) => d, { domain, thresholds: $.get(thresholds) }));
	var fragment = root_1();
	var div = $.first_child(fragment);
	var input = $.child(div);

	$.remove_input_defaults(input);

	var span = $.sibling(input, 2);
	var text = $.only_child(span);

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0));

		LayerCake(node, {
			padding: { top: 20, right: 5, bottom: 20, left: 30 },
			get x() {
				return xKey;
			},
			y: yKey,
			get xDomain() {
				return $.get(thresholds);
			},

			get xScale() {
				return $.get($0);
			},
			yDomain: [0, null],
			get data() {
				return $.get(binnedData);
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						AxisX(node_1, {
							gridlines: false,
							baseline: true,
							get ticks() {
								return $.get(slimThresholds);
							},
							format: (d) => String(+f(d))
						});

						var node_2 = $.sibling(node_1, 2);

						AxisY(node_2, { gridlines: false, ticks: 3 });

						var node_3 = $.sibling(node_2, 2);

						Column(node_3, { fill: '#fff', stroke: '#000', strokeWidth: 1 });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_1);
	$.template_effect(() => $.set_text(text, `${$.get(binCount) ?? ''} bins`));
	$.bind_value(input, () => $.get(binCount), ($$value) => $.set(binCount, $$value));
	$.append($$anchor, fragment);
	$.pop();
}