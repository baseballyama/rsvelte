import * as $ from 'svelte/internal/server';
import { Center, NumberInput, Stack } from '@svelteuidev/core';

const code = `
<script>
    import { NumberInput } from '@svelteuidev/core';
<\/script>

<NumberInput label='By default controls are visible' placeholder='Visible'\/>

<NumberInput
    label='Disable with hideControls prop'
    placeholder='Disable with hideControls prop'
    hideControls
\/>

<NumberInput
    label='Controls also not rendered when input is disabled'
    placeholder='Disabled'
    disabled
\/>
`;

export const type = 'demo';
export const configuration = { code };

export default function NumberInput_demo_controls($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				position: 'center',
				children: ($$renderer) => {
					NumberInput($$renderer, {
						label: 'By default controls are visible',
						placeholder: 'Visible'
					});

					$$renderer.push(`<!----> `);

					NumberInput($$renderer, {
						label: 'Disable with hideControls prop',
						placeholder: 'Disabled with hideControls prop',
						hideControls: true
					});

					$$renderer.push(`<!----> `);

					NumberInput($$renderer, {
						label: 'Controls also not rendered when input is disabled',
						placeholder: 'Disabled',
						disabled: true
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}