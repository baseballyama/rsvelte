import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Checkbox, CheckboxGroup, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <div><strong>selected:</strong> </div>`, 1);

export default function CheckboxGroupReactive($$anchor) {
	let selected = ["email"];

	Stack($$anchor, {
		inline: true,
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			CheckboxGroup(node, {
				legendText: 'Notification preferences',
				name: 'prefs',
				get selected() {
					return selected;
				},

				set selected($$value) {
					selected = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Checkbox(node_1, { value: 'email', labelText: 'Email' });

					var node_2 = $.sibling(node_1, 2);

					Checkbox(node_2, { value: 'sms', labelText: 'SMS' });

					var node_3 = $.sibling(node_2, 2);

					Checkbox(node_3, { value: 'push', labelText: 'Push notifications' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			Button(node_4, {
				$$events: { click: () => selected = ["email", "push"] },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Select Email + Push');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_4, 2);
			var text_1 = $.sibling($.child(div));

			$.reset(div);
			$.template_effect(($0) => $.set_text(text_1, ` ${$0 ?? ''}`), [() => JSON.stringify(selected)]);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}