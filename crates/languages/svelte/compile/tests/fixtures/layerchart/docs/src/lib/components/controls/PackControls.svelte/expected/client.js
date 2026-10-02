import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-[2fr_1fr] gap-2 screenshot-hidden"><!> <!></div>`);

export default function PackControls($$anchor, $$props) {
	$.push($$props, true);

	let padding = $.prop($$props, 'padding', 15, 0),
		colorBy = $.prop($$props, 'colorBy', 15, 'parent');

	var div = root_1();
	var node = $.child(div);

	RangeField(node, {
		label: 'Padding',
		max: 50,
		get value() {
			return padding();
		},

		set value($$value) {
			padding($$value);
		}
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Color By',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return colorBy();
				},

				set value($$value) {
					colorBy($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					ToggleOption(node_2, {
						value: 'parent',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Parent');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					ToggleOption(node_3, {
						value: 'depth',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Depth');

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