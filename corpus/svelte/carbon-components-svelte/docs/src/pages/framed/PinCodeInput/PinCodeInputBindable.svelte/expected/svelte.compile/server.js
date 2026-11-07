import * as $ from 'svelte/internal/server';
import { PinCodeInput, Stack } from "carbon-components-svelte";

export default function PinCodeInputBindable($$renderer) {
	let value = "";
	let complete = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 4,
			children: ($$renderer) => {
				PinCodeInput($$renderer, {
					count: 4,
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

				$$renderer.push(`<!----> <div>value: ${$.escape(JSON.stringify(value))}</div> <div>complete: ${$.escape(complete)}</div>`);
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