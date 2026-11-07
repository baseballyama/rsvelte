import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider, Stack } from "carbon-components-svelte";

var root = $.from_html(`<div>Item 1</div> <div>Item 2</div> <div>Item 3</div>`, 1);
var root_1 = $.from_html(`<div style="margin-bottom: 1.5rem"><!></div> <!>`, 1);

export default function StackVerticalGap($$anchor) {
	let gap = 5;
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Slider(node, {
		labelText: 'Gap',
		min: 0,
		max: 13,
		minLabel: '0',
		maxLabel: '13',
		get value() {
			return gap;
		},

		set value($$value) {
			gap = $$value;
		}
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Stack(node_1, {
		orientation: 'vertical',
		get gap() {
			return gap;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(4);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}