import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, NumberInput, Stack } from "carbon-components-svelte";

export default function NumberInputDecimal($$renderer) {
	let value = 1.5;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 4,
			children: ($$renderer) => {
				NumberInput($$renderer, {
					allowDecimal: true,
					allowEmpty: true,
					step: 0.01,
					labelText: 'Amount',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				ButtonSet($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Set to null`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Set to 0`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Set to 1.23`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div><strong>Value:</strong> ${$.escape(value)}</div>`);
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