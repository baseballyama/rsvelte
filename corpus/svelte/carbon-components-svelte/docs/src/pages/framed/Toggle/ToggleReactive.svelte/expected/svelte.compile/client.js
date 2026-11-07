import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Stack, Toggle } from "carbon-components-svelte";

var root = $.from_html(`<!> <div><!></div>`, 1);

export default function ToggleReactive($$anchor) {
	let toggled = true;

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Toggle(node, {
				labelText: 'Push notifications',
				get toggled() {
					return toggled;
				},

				set toggled($$value) {
					toggled = $$value;
				}
			});

			var div = $.sibling(node, 2);
			var node_1 = $.child(div);

			Button(node_1, {
				kind: 'tertiary',
				size: 'small',
				$$events: { click: () => toggled = !toggled },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, `Toggle
      ${toggled ? "off" : "on"}`));

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}