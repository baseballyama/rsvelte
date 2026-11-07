import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	ButtonSet,
	InlineLoading,
	InlineNotification,
	PinCodeInput,
	Stack
} from "carbon-components-svelte";

import { onMount } from "svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function PinCodeInputUx($$anchor, $$props) {
	$.push($$props, true);

	// For demo purposes only: NEVER perform local verification of OTP codes.
	const EXPECTED_CODE = "A1B2";

	const VERIFY_DELAY_MS = 400;

	function normalize(value) {
		return value.toUpperCase().replace(/\s/g, "");
	}

	let pinCodeInput;
	let verifyTimeout;
	let loading = $.state(false);
	let invalid = $.state(false);
	let invalidText = $.state("");
	let verified = $.state(false);

	function clearVerificationState() {
		if (verifyTimeout) clearTimeout(verifyTimeout);

		$.set(loading, false);
		$.set(invalid, false);
		$.set(invalidText, "");
		$.set(verified, false);
	}

	function handleComplete(event) {
		clearVerificationState();
		$.set(loading, true);

		verifyTimeout = setTimeout(
			() => {
				$.set(loading, false);

				if (normalize(event.detail.value) === normalize(EXPECTED_CODE)) {
					$.set(verified, true);
				} else {
					$.set(invalid, true);
					$.set(invalidText, "The code you entered is incorrect");
				}
			},
			VERIFY_DELAY_MS
		);
	}

	function resetVerification() {
		clearVerificationState();
		pinCodeInput?.clear({ focus: true });
	}

	function handleChange() {
		if ($.get(loading)) return;
		if (!$.get(invalid) && !$.get(verified)) return;

		$.set(invalid, false);
		$.set(invalidText, "");
		$.set(verified, false);
	}

	onMount(() => {
		return () => {
			if (verifyTimeout) clearTimeout(verifyTimeout);
		};
	});

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.bind_this(
				PinCodeInput(node, {
					type: 'alphanumeric',
					uppercase: true,
					get count() {
						return EXPECTED_CODE.length;
					},
					labelText: 'Invite code',
					helperText: 'Enter the code sent to your email (try A1B2)',
					get disabled() {
						return $.get(loading);
					},

					get invalid() {
						return $.get(invalid);
					},

					get invalidText() {
						return $.get(invalidText);
					},

					$$events: {
						complete: handleComplete,
						change: handleChange,
						clear: clearVerificationState
					}
				}),
				($$value) => pinCodeInput = $$value,
				() => pinCodeInput
			);

			var node_1 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					InlineLoading($$anchor, { status: 'active', description: 'Verifying code...' });
				};

				var consequent_1 = ($$anchor) => {
					InlineNotification($$anchor, {
						kind: 'success',
						title: 'Code verified',
						subtitle: 'Your invite code was accepted.',
						hideCloseButton: true,
						lowContrast: true
					});
				};

				$.if(node_1, ($$render) => {
					if ($.get(loading)) $$render(consequent); else if ($.get(verified)) $$render(consequent_1, 1);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			ButtonSet(node_2, {
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => !$.get(verified) && !$.get(invalid));

						Button($$anchor, {
							kind: 'tertiary',
							get disabled() {
								return $.get($0);
							},
							$$events: { click: resetVerification },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Reset');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}