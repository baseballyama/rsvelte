import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, RadioButton, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <div><!></div>`, 1);

export default function RadioButtonStandalone($$anchor) {
	let agreedToTerms = false;

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Stack(node, {
				align: 'start',
				children: ($$anchor, $$slotProps) => {
					RadioButton($$anchor, {
						labelText: 'I agree to the terms and conditions',
						name: 'terms',
						value: 'agreed',
						get checked() {
							return agreedToTerms;
						},

						set checked($$value) {
							agreedToTerms = $$value;
						}
					});
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node, 2);
			var node_1 = $.child(div);

			{
				let $0 = $.derived(() => !agreedToTerms);

				Button(node_1, {
					size: 'small',
					kind: 'secondary',
					get disabled() {
						return $.get($0);
					},
					$$events: { click: () => agreedToTerms = !agreedToTerms },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Reset');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}