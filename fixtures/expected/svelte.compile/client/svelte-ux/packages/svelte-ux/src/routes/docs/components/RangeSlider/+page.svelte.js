import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeSlider } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<h1>Examples</h1> <h2>Description</h2> <h2>basic</h2> <!> <h2>disabled</h2> <!> <h2>bind:value</h2> <!> <h2>min/max</h2> <!> <h2>step</h2> <h3>small</h3> <!> <h2>step</h2> <h3>large</h3> <!> <h2>disableTooltips</h2> <!>`, 1);

export default function _page($$anchor) {
	let value = [25, 75];
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 6);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			RangeSlider($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			RangeSlider($$anchor, { disabled: true });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			RangeSlider($$anchor, {
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			RangeSlider($$anchor, { min: 50, max: 100 });
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 6);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			RangeSlider($$anchor, { max: 1, step: 0.01 });
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 6);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			RangeSlider($$anchor, { max: 100, step: 10 });
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			RangeSlider($$anchor, { disableTooltips: true });
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}