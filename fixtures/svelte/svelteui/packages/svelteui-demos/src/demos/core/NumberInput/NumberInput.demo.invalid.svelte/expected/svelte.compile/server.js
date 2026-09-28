import * as $ from 'svelte/internal/server';
import { Center, Stack, NumberInput } from '@svelteuidev/core';

const code = `
<script>
    import { NumberInput } from '@svelteuidev/core';
<\/script>

<NumberInput error label='Your age' defaultValue={19} \/>
<NumberInput error='You must be at least 18' label='Your age' defaultValue={16} \/>
`;

export const type = 'demo';
export const configuration = { code };

export default function NumberInput_demo_invalid($$renderer) {
	let value;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Center($$renderer, {
			children: ($$renderer) => {
				Stack($$renderer, {
					position: 'center',
					children: ($$renderer) => {
						NumberInput($$renderer, { error: true, label: 'Your age', defaultValue: 19 });
						$$renderer.push(`<!----> `);

						NumberInput($$renderer, {
							error: value < 18 ? 'You must be at least 18' : null,
							label: 'Your age',
							defaultValue: 16,
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
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