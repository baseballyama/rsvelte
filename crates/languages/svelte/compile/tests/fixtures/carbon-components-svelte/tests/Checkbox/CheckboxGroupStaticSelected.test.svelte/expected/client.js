import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";
import CheckboxGroup from "carbon-components-svelte/Checkbox/CheckboxGroup.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function CheckboxGroupStaticSelected_test($$anchor) {
	CheckboxGroup($$anchor, {
		legendText: 'Notification preferences',
		name: 'prefs',
		selected: ["email"],
		$$events: {
			change: (e) => {
				console.log("change", e.detail);
			}
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Checkbox(node, { value: 'email', labelText: 'Email' });

			var node_1 = $.sibling(node, 2);

			Checkbox(node_1, { value: 'sms', labelText: 'SMS' });

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, { value: 'push', labelText: 'Push notifications' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}