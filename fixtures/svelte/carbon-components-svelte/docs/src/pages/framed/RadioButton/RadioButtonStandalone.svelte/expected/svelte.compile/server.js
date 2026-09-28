import * as $ from 'svelte/internal/server';
import { Button, RadioButton, Stack } from "carbon-components-svelte";

export default function RadioButtonStandalone($$renderer) {
	let agreedToTerms = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				Stack($$renderer, {
					align: 'start',
					children: ($$renderer) => {
						RadioButton($$renderer, {
							labelText: 'I agree to the terms and conditions',
							name: 'terms',
							value: 'agreed',
							get checked() {
								return agreedToTerms;
							},

							set checked($$value) {
								agreedToTerms = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div>`);

				Button($$renderer, {
					size: 'small',
					kind: 'secondary',
					disabled: !agreedToTerms,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Reset`);
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