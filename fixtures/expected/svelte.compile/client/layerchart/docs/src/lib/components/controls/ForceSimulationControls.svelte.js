import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex justify-end gap-2 items-end mb-2 screenshot-hidden"><!></div>`);

export default function ForceSimulationControls($$anchor, $$props) {
	$.push($$props, true);

	let groupBy = $.prop($$props, 'groupBy', 15, true);
	var div = root_1();
	var node = $.child(div);

	Field(node, {
		labelPlacement: 'left',
		class: 'mb-1',
		dense: true,
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				size: 'sm',
				get value() {
					return groupBy();
				},

				set value($$value) {
					groupBy($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					ToggleOption(node_1, {
						value: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Group');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					ToggleOption(node_2, {
						value: false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Clump');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}