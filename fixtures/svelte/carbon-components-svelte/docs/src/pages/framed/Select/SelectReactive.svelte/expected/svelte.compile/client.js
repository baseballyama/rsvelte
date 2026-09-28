import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Select, SelectItem, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function SelectReactive($$anchor) {
	let selected = "g10";

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Select(node, {
				labelText: 'Carbon theme',
				get helperText() {
					return `Selected: ${selected ?? ''}`;
				},

				get selected() {
					return selected;
				},

				set selected($$value) {
					selected = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					SelectItem(node_1, { value: 'white', text: 'White' });

					var node_2 = $.sibling(node_1, 2);

					SelectItem(node_2, { value: 'g10', text: 'Gray 10' });

					var node_3 = $.sibling(node_2, 2);

					SelectItem(node_3, { value: 'g80', text: 'Gray 80' });

					var node_4 = $.sibling(node_3, 2);

					SelectItem(node_4, { value: 'g90', text: 'Gray 90' });

					var node_5 = $.sibling(node_4, 2);

					SelectItem(node_5, { value: 'g100', text: 'Gray 100' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node, 2);

			{
				let $0 = $.derived(() => selected === "g90");

				Button(node_6, {
					kind: 'tertiary',
					size: 'small',
					get disabled() {
						return $.get($0);
					},
					$$events: { click: () => selected = "g90" },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Set to "g90"');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}