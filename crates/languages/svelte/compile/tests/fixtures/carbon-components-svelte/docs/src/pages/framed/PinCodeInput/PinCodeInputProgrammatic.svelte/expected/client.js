import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, PinCodeInput, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div> </div> <!>`, 1);

export default function PinCodeInputProgrammatic($$anchor) {
	let pinCodeInput;
	let value = "018";

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			$.bind_this(
				PinCodeInput(node, {
					labelText: 'Verification code',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
					}
				}),
				($$value) => pinCodeInput = $$value,
				() => pinCodeInput
			);

			var div = $.sibling(node, 2);
			var text = $.only_child(div);
			var node_1 = $.sibling(div, 2);

			Stack(node_1, {
				gap: 4,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_2 = $.first_child(fragment_2);

					ButtonSet(node_2, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							Button(node_3, {
								kind: 'tertiary',
								size: 'small',
								$$events: { click: () => pinCodeInput?.focusFirstInput() },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Focus first');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Button(node_4, {
								kind: 'tertiary',
								size: 'small',
								$$events: { click: () => pinCodeInput?.focusLastInput() },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Focus last');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							Button(node_5, {
								kind: 'tertiary',
								size: 'small',
								$$events: { click: () => pinCodeInput?.focusNextEmptyInput() },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Focus next empty');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							Button(node_6, {
								kind: 'tertiary',
								size: 'small',
								$$events: { click: () => pinCodeInput?.focusNext() },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Focus next');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Button(node_7, {
								kind: 'tertiary',
								size: 'small',
								$$events: {
									click: () => pinCodeInput?.focusFirstInput({ selectTextOnFocus: true })
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Focus first (select)');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_2, 2);

					ButtonSet(node_8, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_9 = $.first_child(fragment_4);

							Button(node_9, {
								kind: 'tertiary',
								size: 'small',
								$$events: { click: () => pinCodeInput?.clear() },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Clear');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							Button(node_10, {
								kind: 'tertiary',
								size: 'small',
								$$events: { click: () => pinCodeInput?.clear({ focus: true }) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Clear (focus)');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.template_effect(($0) => $.set_text(text, `value: ${$0 ?? ''}`), [() => JSON.stringify(value)]);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}