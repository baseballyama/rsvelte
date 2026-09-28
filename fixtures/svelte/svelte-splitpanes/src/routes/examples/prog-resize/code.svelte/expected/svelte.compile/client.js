import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';
import RangeSlider from 'svelte-range-slider-pips';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<span>Auto-Calculated</span>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Code($$anchor) {
	let value = [50];
	var fragment = root_2();
	var node = $.first_child(fragment);

	RangeSlider(node, {
		float: true,
		min: 0,
		step: 0.01,
		max: 100,
		get values() {
			return value;
		},

		set values($$value) {
			value = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Splitpanes(node_1, {
		style: 'height: 400px',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_2 = $.first_child(fragment_1);

			Pane(node_2, {
				get size() {
					return value[0];
				},

				set size($$value) {
					value[0] = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var span = root();
					var text = $.only_child(span);

					$.template_effect(($0) => $.set_text(text, `${$0 ?? ''}%`), [() => Math.round(value[0])]);
					$.append($$anchor, span);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Pane(node_3, {
				children: ($$anchor, $$slotProps) => {
					var span_1 = root_1();

					$.append($$anchor, span_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}