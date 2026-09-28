import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, PinCodeInput, Stack } from "carbon-components-svelte";

export default function PinCodeInputProgrammatic($$renderer) {
	let pinCodeInput;
	let value = "018";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				PinCodeInput($$renderer, {
					labelText: 'Verification code',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <div>value: ${$.escape(JSON.stringify(value))}</div> `);

				Stack($$renderer, {
					gap: 4,
					children: ($$renderer) => {
						ButtonSet($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									kind: 'tertiary',
									size: 'small',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Focus first`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									kind: 'tertiary',
									size: 'small',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Focus last`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									kind: 'tertiary',
									size: 'small',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Focus next empty`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									kind: 'tertiary',
									size: 'small',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Focus next`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									kind: 'tertiary',
									size: 'small',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Focus first (select)`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ButtonSet($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									kind: 'tertiary',
									size: 'small',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Clear`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									kind: 'tertiary',
									size: 'small',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Clear (focus)`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
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