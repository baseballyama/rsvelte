import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function TextTruncateControls($$anchor, $$props) {
	$.push($$props, true);

	let position = $.prop($$props, 'position', 15, 'end');

	Field($$anchor, {
		label: 'truncate position',
		classes: { container: 'w-fit' },
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return position();
				},

				set value($$value) {
					position($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					ToggleOption(node, {
						value: 'start',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('start');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					ToggleOption(node_1, {
						value: 'middle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('middle');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					ToggleOption(node_2, {
						value: 'end',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('end');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}