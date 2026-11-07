import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeField } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<h1>Examples</h1> <h2>basic</h2> <!> <h2>label</h2> <!> <h2>bind:value</h2> <!> <h2>on:change</h2> <!> <h2>min / max</h2> <!> <h2>step</h2> <!> <h2>format</h2> <!>`, 1);

export default function _page($$anchor) {
	let value = 10;
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			RangeField($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			RangeField($$anchor, { label: 'Range' });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_3 = $.first_child(fragment_3);

			RangeField(node_3, {
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});

			var text = $.sibling(node_3);

			$.template_effect(() => $.set_text(text, ` ${value ?? ''}`));
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			RangeField($$anchor, { $$events: { change: (e) => console.log(e.detail.value) } });
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			RangeField($$anchor, { min: 0, max: 10 });
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			RangeField($$anchor, { min: 0, max: 10, step: 0.1 });
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			RangeField($$anchor, { min: 0, max: 10, step: 0.1, format: 'decimal' });
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}