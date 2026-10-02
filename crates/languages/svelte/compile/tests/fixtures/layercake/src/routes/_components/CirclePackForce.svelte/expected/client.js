import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import { scaleOrdinal, scaleBand } from 'd3-scale';
import ForceLayout from '../../_components/CirclePackForce.svelte';
import data from '../../_data/dots.json';

var root = $.from_html(`<div class="input-container"><label class="svelte-215hks"><input type="radio" class="svelte-215hks"/>GroupBy \`true\`</label> <label class="svelte-215hks"><input type="radio" class="svelte-215hks"/>GroupBy \`false\`</label></div> <div class="chart-container svelte-215hks"><!></div>`, 1);

export default function CirclePackForce($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const xKey = 'category';
	const rKey = 'value';
	const zKey = 'category';
	let groupBy = $.state('true');
	const seriesNameSet = new Set();
	const seriesColors = ['#f0c', '#0cf', '#fc0'];

	data.forEach((d) => {
		seriesNameSet.add(d[zKey]);
	});

	/* --------------------------------------------
	 * Convert this to an array so we can use it in our scales
	 */
	const seriesNames = [...seriesNameSet];

	let manyBodyStrength = 3;
	let xStrength = 0.1;
	var fragment = root();
	var div = $.first_child(fragment);
	var label = $.child(div);
	var input = $.child(label);

	$.remove_input_defaults(input);
	input.value = input.__value = 'true';
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'false';
	$.next();
	$.reset(label_1);
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node = $.child(div_1);

	{
		let $0 = $.derived(scaleBand);
		let $1 = $.derived(scaleOrdinal);

		LayerCake(node, {
			get data() {
				return data;
			},
			x: xKey,
			r: rKey,
			z: zKey,
			get xScale() {
				return $.get($0);
			},

			get xDomain() {
				return seriesNames;
			},
			rRange: [3, 12],
			get zScale() {
				return $.get($1);
			},

			get zDomain() {
				return seriesNames;
			},

			get zRange() {
				return seriesColors;
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => JSON.parse($.get(groupBy)));

							ForceLayout($$anchor, {
								manyBodyStrength,
								xStrength,
								get groupBy() {
									return $.get($0);
								},
								nodeStroke: '#000'
							});
						}
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_1);
	$.bind_group(binding_group, [], input, () => $.get(groupBy), ($$value) => $.set(groupBy, $$value));
	$.bind_group(binding_group, [], input_1, () => $.get(groupBy), ($$value) => $.set(groupBy, $$value));
	$.append($$anchor, fragment);
	$.pop();
}