import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Checkbox, Stack } from "carbon-components-svelte";

var root = $.from_html(`<div></div> <!> <div><strong>Selected:</strong> </div>`, 1);

export default function MultipleCheckboxes($$anchor) {
	const binding_group = [];
	let values = ["Apple", "Banana", "Coconut"];
	let group = values.slice(0, 2);

	Stack($$anchor, {
		inline: true,
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);

			$.each(div, 21, () => values, $.index, ($$anchor, value) => {
				Checkbox($$anchor, {
					get labelText() {
						return $.get(value);
					},

					get value() {
						return $.get(value);
					},

					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
					}
				});
			});

			$.reset(div);

			var node = $.sibling(div, 2);

			Button(node, {
				$$events: { click: () => group = ["Banana"] },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Set to ["Banana"]');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node, 2);
			var text_1 = $.sibling($.child(div_1));

			$.reset(div_1);
			$.template_effect(($0) => $.set_text(text_1, ` ${$0 ?? ''}`), [() => JSON.stringify(group)]);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}