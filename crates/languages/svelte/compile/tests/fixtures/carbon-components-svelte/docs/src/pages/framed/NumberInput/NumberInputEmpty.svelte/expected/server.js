import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, NumberInput, Stack } from "carbon-components-svelte";

export default function NumberInputEmpty($$renderer) {
	let value = null;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 4,
			children: ($$renderer) => {
				NumberInput($$renderer, {
					labelText: 'Clusters',
					allowEmpty: true,
					helperText: `Value: ${$.stringify(value)}`,
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
							kind: 'tertiary',
							size: 'small',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Set to null`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							kind: 'tertiary',
							size: 'small',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Set to 0`);
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