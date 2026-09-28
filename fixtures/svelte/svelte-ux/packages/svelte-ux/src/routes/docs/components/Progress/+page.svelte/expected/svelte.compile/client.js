import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <input type="range" class="w-full"/>`, 1);
var root_4 = $.from_html(`<h1>Examples</h1> <h2>Value</h2> <!> <h2>Max</h2> <!> <h2>Color</h2> <!> <h2>Track color</h2> <!> <h2>Color based on value</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let value = 50;
	var fragment = root_4();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Progress(node_1, { value: 0 });

			var node_2 = $.sibling(node_1, 2);

			Progress(node_2, { value: 0.2 });

			var node_3 = $.sibling(node_2, 2);

			Progress(node_3, { value: 0.4 });

			var node_4 = $.sibling(node_3, 2);

			Progress(node_4, { value: 0.6 });

			var node_5 = $.sibling(node_4, 2);

			Progress(node_5, { value: 0.8 });

			var node_6 = $.sibling(node_5, 2);

			Progress(node_6, { value: 1 });

			var node_7 = $.sibling(node_6, 2);

			Progress(node_7, { value: null });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			Progress($$anchor, { value: 50, max: 100 });
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 4);

	Preview(node_9, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_1();
			var node_10 = $.first_child(fragment_3);

			Progress(node_10, { value: 0.5, class: '[--color:theme(colors.success)]' });

			var node_11 = $.sibling(node_10, 2);

			Progress(node_11, { value: 0.7, class: '[--color:theme(colors.warning)]' });

			var node_12 = $.sibling(node_11, 2);

			Progress(node_12, { value: 0.9, class: '[--color:theme(colors.danger)]' });
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_9, 4);

	Preview(node_13, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_2();
			var node_14 = $.first_child(fragment_4);

			Progress(node_14, {
				value: 0.5,
				class: '[--track-color:theme(colors.primary/5%)]'
			});

			var node_15 = $.sibling(node_14, 2);

			Progress(node_15, {
				value: 0.5,
				class: '[--color:theme(colors.success)] [--track-color:theme(colors.success/5%)]'
			});

			var node_16 = $.sibling(node_15, 2);

			Progress(node_16, {
				value: 0.7,
				class: '[--color:theme(colors.warning)] [--track-color:theme(colors.warning/5%)]'
			});

			var node_17 = $.sibling(node_16, 2);

			Progress(node_17, {
				value: 0.9,
				class: '[--color:theme(colors.danger)] [--track-color:theme(colors.danger/5%)]'
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_13, 4);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_3();
			var node_19 = $.first_child(fragment_5);

			{
				let $0 = $.derived(() => cls(value > 90
					? '[--color:theme(colors.danger)]'
					: value > 50
						? '[--color:theme(colors.warning)]'
						: '[--color:theme(colors.success)]'));

				Progress(node_19, {
					get class() {
						return $.get($0);
					},
					max: 100,
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
					}
				});
			}

			var input = $.sibling(node_19, 2);

			$.remove_input_defaults(input);
			$.bind_value(input, () => value, ($$value) => value = $$value);
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}