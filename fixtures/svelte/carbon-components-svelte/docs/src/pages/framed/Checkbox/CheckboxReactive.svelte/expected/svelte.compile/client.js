import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Checkbox, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <div><strong>checked:</strong> </div>`, 1);

export default function CheckboxReactive($$anchor) {
	let checked = false;

	Stack($$anchor, {
		inline: true,
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Checkbox(node, {
				labelText: 'Label text',
				get checked() {
					return checked;
				},

				set checked($$value) {
					checked = $$value;
				}
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				$$events: { click: () => checked = !checked },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Toggle');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_1, 2);
			var text_1 = $.sibling($.child(div));

			$.reset(div);
			$.template_effect(() => $.set_text(text_1, ` ${checked ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}