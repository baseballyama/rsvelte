import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScatterChart } from 'layerchart';
import { getSpiral } from '$lib/utils/data.js';
import { Switch } from 'svelte-ux';

var root = $.from_html(`<label class="flex gap-2 pb-4 screenshot-hidden"><!> </label> <!>`, 1);

export default function Domain_nice($$anchor, $$props) {
	$.push($$props, true);

	const data = getSpiral({
		angle: 137.5,
		radius: 10,
		count: 100,
		width: 500,
		height: 500
	});

	let applyNice = $.state(true);
	var $$exports = { data };
	var fragment = root();
	var label = $.first_child(fragment);
	var node = $.child(label);

	Switch(node, {
		get checked() {
			return $.get(applyNice);
		},

		set checked($$value) {
			$.set(applyNice, $$value, true);
		}
	});

	var text = $.sibling(node);

	$.reset(label);

	var node_1 = $.sibling(label, 2);

	ScatterChart(node_1, {
		get data() {
			return data;
		},
		x: 'x',
		y: 'y',
		get xNice() {
			return $.get(applyNice);
		},

		get yNice() {
			return $.get(applyNice);
		},
		padding: 24,
		height: 400
	});

	$.template_effect(() => $.set_text(text, ` ${$.get(applyNice) ? 'Applying Nice' : 'Not applying Nice'}`));
	$.append($$anchor, fragment);

	return $.pop($$exports);
}