import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, NumberInput, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function NumberInputEmpty($$anchor) {
	let value = null;

	Stack($$anchor, {
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			NumberInput(node, {
				labelText: 'Clusters',
				allowEmpty: true,
				get helperText() {
					return `Value: ${value ?? ''}`;
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});

			var node_1 = $.sibling(node, 2);

			ButtonSet(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Button(node_2, {
						kind: 'tertiary',
						size: 'small',
						$$events: { click: () => value = null },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Set to null');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						kind: 'tertiary',
						size: 'small',
						$$events: { click: () => value = 0 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Set to 0');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}