import * as $ from 'svelte/internal/server';
import { Button, PinCodeInput, Stack } from "carbon-components-svelte";

export default function PinCodeInputFixture($$renderer) {
	let value = "";
	let complete = false;
	let alphanumericValue = "";
	let programmaticValue = "018";
	let pinCodeInput;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 7,
			children: ($$renderer) => {
				$$renderer.push(`<div data-testid="pin-code-input-default">`);

				PinCodeInput($$renderer, {
					labelText: 'Verification code',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					get complete() {
						return complete;
					},

					set complete($$value) {
						complete = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <span data-testid="pin-code-input-value">${$.escape(value)}</span> <span data-testid="pin-code-input-complete">${$.escape(complete)}</span></div> <div data-testid="pin-code-input-alphanumeric">`);

				PinCodeInput($$renderer, {
					labelText: 'Invite code',
					type: 'alphanumeric',
					get value() {
						return alphanumericValue;
					},

					set value($$value) {
						alphanumericValue = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <span data-testid="pin-code-input-alphanumeric-value">${$.escape(alphanumericValue)}</span></div> <div data-testid="pin-code-input-invalid">`);

				PinCodeInput($$renderer, {
					labelText: 'Verification code',
					invalid: true,
					invalidText: 'Incorrect code',
					value: '018'
				});

				$$renderer.push(`<!----></div> <div data-testid="pin-code-input-disabled">`);

				PinCodeInput($$renderer, {
					labelText: 'Verification code',
					disabled: true,
					value: '0182'
				});

				$$renderer.push(`<!----></div> <div data-testid="pin-code-input-readonly">`);

				PinCodeInput($$renderer, {
					labelText: 'Verification code',
					readonly: true,
					value: '0182'
				});

				$$renderer.push(`<!----></div> <div data-testid="pin-code-input-programmatic">`);

				PinCodeInput($$renderer, {
					labelText: 'Verification code',
					get value() {
						return programmaticValue;
					},

					set value($$value) {
						programmaticValue = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <span data-testid="pin-code-input-programmatic-value">${$.escape(programmaticValue)}</span> `);

				Button($$renderer, {
					'data-testid': 'pin-code-input-clear',
					kind: 'tertiary',
					size: 'small',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Clear`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}