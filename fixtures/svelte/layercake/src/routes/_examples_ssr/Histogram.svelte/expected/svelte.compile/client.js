import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, ScaledSvg, Html, takeEvery } from 'layercake';
import { extent, bin } from 'd3-array';
import { scaleBand } from 'd3-scale';
import { format } from 'd3-format';
import Column from '../../_components/Column.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import calcThresholds from '../../_modules/calcThresholds.js';
import data from '../../_data/unemployment.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="input-container" style="position: absolute;right:10px;z-index: 9;"><input style="margin:0;" type="range" min="4" max="100" step="4" class="svelte-5bi4uq"/> <span class="counter-container" style="display:inline-block;vertical-align:top;width: 70px;text-align:right;"> </span></div> <div class="chart-container svelte-5bi4uq"><!></div>`, 1);

export default function Histogram($$anchor, $$props) {
	$.push($$props, true);

	const f = format('.2f');
	let binCount = $.state(40);
	const xKey = ['x0', 'x1'];
	const yKey = 'length';
	const domain = extent(data);
	let steps = $.derived(() => calcThresholds(domain, $.get(binCount)));
	let hist = $.derived(() => bin().domain(domain).thresholds($.get(steps)));
	let slimSteps = $.derived(() => takeEvery($.get(steps), 7));
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
		let $1 = $.derived(() => $.get(hist)(data));

		LayerCake(node, {
			ssr: true,
			percentRange: true,
			padding: { top: 20, right: 5, bottom: 20, left: 31 },
			get x() {
				return xKey;
			},
			y: yKey,
			get xDomain() {
				return $.get(steps);
			},

			get xScale() {
				return $.get($0);
			},
			yDomain: [0, null],
			get data() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				Html(node_1, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						AxisX(node_2, {
							gridlines: false,
							baseline: true,
							get ticks() {
								return $.get(slimSteps);
							},
							format: (d) => String(+f(d))
						});

						var node_3 = $.sibling(node_2, 2);

						AxisY(node_3, { gridlines: false, ticks: 3 });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_1, 2);

				ScaledSvg(node_4, {
					children: ($$anchor, $$slotProps) => {
						Column($$anchor, { fill: '#fff', stroke: '#000', strokeWidth: 1 });
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
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