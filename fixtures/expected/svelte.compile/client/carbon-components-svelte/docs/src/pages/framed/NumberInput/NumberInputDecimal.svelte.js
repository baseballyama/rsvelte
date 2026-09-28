import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, NumberInput, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <div><strong>Value:</strong> </div>`, 1);

export default function NumberInputDecimal($$anchor) {
	let value = 1.5;

	Stack($$anchor, {
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			NumberInput(node, {
				allowDecimal: true,
				allowEmpty: true,
				step: 0.01,
				labelText: 'Amount',
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
						$$events: { click: () => value = 0 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Set to 0');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Button(node_4, {
						$$events: { click: () => value = 1.23 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Set to 1.23');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_1, 2);
			var text_3 = $.sibling($.child(div));

			$.reset(div);
			$.template_effect(() => $.set_text(text_3, ` ${value ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}