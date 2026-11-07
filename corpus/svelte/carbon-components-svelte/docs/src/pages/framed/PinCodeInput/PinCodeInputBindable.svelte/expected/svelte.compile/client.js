import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PinCodeInput, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <div> </div> <div> </div>`, 1);

export default function PinCodeInputBindable($$anchor) {
	let value = "";
	let complete = false;

	Stack($$anchor, {
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			PinCodeInput(node, {
				count: 4,
				labelText: 'Verification code',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				get complete() {
					return complete;
				},

				set complete($$value) {
					complete = $$value;
				}
			});

			var div = $.sibling(node, 2);
			var text = $.only_child(div);
			var div_1 = $.sibling(div, 2);
			var text_1 = $.only_child(div_1);

			$.template_effect(
				($0) => {
					$.set_text(text, `value: ${$0 ?? ''}`);
					$.set_text(text_1, `complete: ${complete ?? ''}`);
				},
				[() => JSON.stringify(value)]
			);

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}