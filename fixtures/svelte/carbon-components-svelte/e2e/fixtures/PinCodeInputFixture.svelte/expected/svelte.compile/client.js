import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, PinCodeInput, Stack } from "carbon-components-svelte";

var root = $.from_html(`<div data-testid="pin-code-input-default"><!> <span data-testid="pin-code-input-value"> </span> <span data-testid="pin-code-input-complete"> </span></div> <div data-testid="pin-code-input-alphanumeric"><!> <span data-testid="pin-code-input-alphanumeric-value"> </span></div> <div data-testid="pin-code-input-invalid"><!></div> <div data-testid="pin-code-input-disabled"><!></div> <div data-testid="pin-code-input-readonly"><!></div> <div data-testid="pin-code-input-programmatic"><!> <span data-testid="pin-code-input-programmatic-value"> </span> <!></div>`, 1);

export default function PinCodeInputFixture($$anchor) {
	let value = "";
	let complete = false;
	let alphanumericValue = "";
	let programmaticValue = "018";
	let pinCodeInput;

	Stack($$anchor, {
		gap: 7,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			PinCodeInput(node, {
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

			var span = $.sibling(node, 2);
			var text = $.only_child(span, true);
			var span_1 = $.sibling(span, 2);
			var text_1 = $.only_child(span_1, true);

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_1 = $.child(div_1);

			PinCodeInput(node_1, {
				labelText: 'Invite code',
				type: 'alphanumeric',
				get value() {
					return alphanumericValue;
				},

				set value($$value) {
					alphanumericValue = $$value;
				}
			});

			var span_2 = $.sibling(node_1, 2);
			var text_2 = $.only_child(span_2, true);

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_2 = $.child(div_2);

			PinCodeInput(node_2, {
				labelText: 'Verification code',
				invalid: true,
				invalidText: 'Incorrect code',
				value: '018'
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_3 = $.child(div_3);

			PinCodeInput(node_3, {
				labelText: 'Verification code',
				disabled: true,
				value: '0182'
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_4 = $.child(div_4);

			PinCodeInput(node_4, {
				labelText: 'Verification code',
				readonly: true,
				value: '0182'
			});

			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var node_5 = $.child(div_5);

			$.bind_this(
				PinCodeInput(node_5, {
					labelText: 'Verification code',
					get value() {
						return programmaticValue;
					},

					set value($$value) {
						programmaticValue = $$value;
					}
				}),
				($$value) => pinCodeInput = $$value,
				() => pinCodeInput
			);

			var span_3 = $.sibling(node_5, 2);
			var text_3 = $.only_child(span_3, true);
			var node_6 = $.sibling(span_3, 2);

			Button(node_6, {
				'data-testid': 'pin-code-input-clear',
				kind: 'tertiary',
				size: 'small',
				$$events: { click: () => pinCodeInput?.clear() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Clear');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);

			$.template_effect(() => {
				$.set_text(text, value);
				$.set_text(text_1, complete);
				$.set_text(text_2, alphanumericValue);
				$.set_text(text_3, programmaticValue);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}