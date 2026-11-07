import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ComboBox, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <div><div><strong>Selected ID:</strong> </div> <div><strong>Current value:</strong> </div></div>`, 1);

export default function AllowCustomValue($$anchor, $$props) {
	$.push($$props, true);

	let selectedId = undefined;
	let value = "";

	Stack($$anchor, {
		gap: 2,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ComboBox(node, {
				allowCustomValue: true,
				labelText: 'Favorite fruit',
				placeholder: 'Select or enter a fruit',
				helperText: 'You can select from the list or type your own',
				items: [
					{ id: "0", text: "Apple" },
					{ id: "1", text: "Banana" },
					{ id: "2", text: "Orange" },
					{ id: "3", text: "Strawberry" }
				],

				shouldFilterItem: (item, value) => {
					if (!value) return true;

					return item.text.toLowerCase().includes(value.toLowerCase());
				},

				get selectedId() {
					return selectedId;
				},

				set selectedId($$value) {
					selectedId = $$value;
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$events: {
					select: (e) => {
						console.log("Selected item:", e.detail);
					}
				}
			});

			var div = $.sibling(node, 2);
			var div_1 = $.child(div);
			var text = $.sibling($.child(div_1));

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var text_1 = $.sibling($.child(div_2));

			$.reset(div_2);
			$.reset(div);

			$.template_effect(() => {
				$.set_text(text, ` ${selectedId ?? "none" ?? ''}`);
				$.set_text(text_1, ` ${(value || "empty") ?? ''}`);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}