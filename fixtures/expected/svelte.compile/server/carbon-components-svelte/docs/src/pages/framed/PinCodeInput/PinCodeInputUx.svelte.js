import * as $ from 'svelte/internal/server';

import {
	Button,
	ButtonSet,
	InlineLoading,
	InlineNotification,
	PinCodeInput,
	Stack
} from "carbon-components-svelte";

import { onMount } from "svelte";

export default function PinCodeInputUx($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// For demo purposes only: NEVER perform local verification of OTP codes.
		const EXPECTED_CODE = "A1B2";

		const VERIFY_DELAY_MS = 400;

		function normalize(value) {
			return value.toUpperCase().replace(/\s/g, "");
		}

		let pinCodeInput;
		let verifyTimeout;
		let loading = false;
		let invalid = false;
		let invalidText = "";
		let verified = false;

		function clearVerificationState() {
			if (verifyTimeout) clearTimeout(verifyTimeout);

			loading = false;
			invalid = false;
			invalidText = "";
			verified = false;
		}

		function handleComplete(event) {
			clearVerificationState();
			loading = true;

			verifyTimeout = setTimeout(
				() => {
					loading = false;

					if (normalize(event.detail.value) === normalize(EXPECTED_CODE)) {
						verified = true;
					} else {
						invalid = true;
						invalidText = "The code you entered is incorrect";
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
			if (loading) return;
			if (!invalid && !verified) return;

			invalid = false;
			invalidText = "";
			verified = false;
		}

		onMount(() => {
			return () => {
				if (verifyTimeout) clearTimeout(verifyTimeout);
			};
		});

		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				PinCodeInput($$renderer, {
					type: 'alphanumeric',
					uppercase: true,
					count: EXPECTED_CODE.length,
					labelText: 'Invite code',
					helperText: 'Enter the code sent to your email (try A1B2)',
					disabled: loading,
					invalid,
					invalidText
				});

				$$renderer.push(`<!----> `);

				if (loading) {
					$$renderer.push('<!--[0-->');
					InlineLoading($$renderer, { status: 'active', description: 'Verifying code...' });
				} else if (verified) {
					$$renderer.push('<!--[1-->');

					InlineNotification($$renderer, {
						kind: 'success',
						title: 'Code verified',
						subtitle: 'Your invite code was accepted.',
						hideCloseButton: true,
						lowContrast: true
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				ButtonSet($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							kind: 'tertiary',
							disabled: !verified && !invalid,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Reset`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}