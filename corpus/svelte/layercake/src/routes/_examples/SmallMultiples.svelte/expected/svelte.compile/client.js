import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { calcExtents, flatten } from 'layercake';
import SmallMultipleWrapper from '../../_components/SmallMultipleWrapper.svelte';
import dataSeries from '../../_data/pointSeries.js';

var root = $.from_html(`<div class="small-multiple-container svelte-1tllc63"><!></div>`);
var root_1 = $.from_html(`<div class="input-container svelte-1tllc63"><label class="svelte-1tllc63"><input type="radio" class="svelte-1tllc63"/>Individual scale</label> <label class="svelte-1tllc63"><input type="radio" class="svelte-1tllc63"/>Shared scale</label></div> <div class="group-container svelte-1tllc63"></div>`, 1);

export default function SmallMultiples($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	/* --------------------------------------------
	 * Grab the extents of the full dataset
	 */
	const extentGetters = { x: (d) => d.x, y: (d) => d.y };

	const fullExtents = calcExtents(flatten(dataSeries), extentGetters);

	/* --------------------------------------------
	 * Sort by the last value
	 */
	dataSeries.sort((a, b) => {
		return b[b.length - 1].y - a[a.length - 1].y;
	});

	let scale = $.state('individual');
	var fragment = root_1();
	var div = $.first_child(fragment);
	var label = $.child(div);
	var input = $.child(label);

	$.remove_input_defaults(input);
	input.value = input.__value = 'individual';
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'shared';
	$.next();
	$.reset(label_1);
	$.reset(div);

	var div_1 = $.sibling(div, 2);

	$.each(div_1, 21, () => dataSeries, $.index, ($$anchor, data) => {
		var div_2 = root();
		var node = $.child(div_2);

		SmallMultipleWrapper(node, {
			get data() {
				return $.get(data);
			},

			get fullExtents() {
				return fullExtents;
			},

			get scale() {
				return $.get(scale);
			},

			get extentGetters() {
				return extentGetters;
			}
		});

		$.reset(div_2);
		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.bind_group(binding_group, [], input, () => $.get(scale), ($$value) => $.set(scale, $$value));
	$.bind_group(binding_group, [], input_1, () => $.get(scale), ($$value) => $.set(scale, $$value));
	$.append($$anchor, fragment);
	$.pop();
}