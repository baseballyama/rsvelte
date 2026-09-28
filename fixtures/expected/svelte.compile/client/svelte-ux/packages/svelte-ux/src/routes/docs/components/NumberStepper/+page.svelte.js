import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NumberStepper } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<span slot="prefix">$</span>`);
var root_2 = $.from_html(`<span slot="suffix">kg</span>`);
var root_3 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>bind:value</h2> <!> <h2>on:change</h2> <!> <h2>Dense</h2> <!> <h2>Min / Max</h2> <!> <h2>Step</h2> <!> <h2>Prefix</h2> <!> <h2>Suffix</h2> <!>`, 1);

export default function _page($$anchor) {
	let value = 10;
	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			NumberStepper($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_2 = $.first_child(fragment_2);

			NumberStepper(node_2, {
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});

			var text = $.sibling(node_2);

			$.template_effect(() => $.set_text(text, ` ${value ?? ''}`));
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			NumberStepper($$anchor, { $$events: { change: (e) => console.log(e.detail.value) } });
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			NumberStepper($$anchor, { dense: true });
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			NumberStepper($$anchor, { min: 0, max: 10 });
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			NumberStepper($$anchor, { step: 0.1 });
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			NumberStepper($$anchor, {
				class: 'w-28',
				$$slots: {
					prefix: ($$anchor, $$slotProps) => {
						var span = root_1();

						$.append($$anchor, span);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			NumberStepper($$anchor, {
				class: 'w-28',
				$$slots: {
					suffix: ($$anchor, $$slotProps) => {
						var span_1 = root_2();

						$.append($$anchor, span_1);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}