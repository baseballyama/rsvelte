import * as $ from 'svelte/internal/server';
import { Center, NumberInput, Stack } from '@svelteuidev/core';

const code = `
<script>
    import { NumberInput } from '@svelteuidev/core';
<\/script>

<NumberInput
    label='Step on hold'
    description='Step the value when clicking and holding the arrows'
    stepHoldDelay={500}
    stepHoldInterval={100}
\/>

<NumberInput
    label='Step the value with interval function'
    description='Step value will increase incrementally when control is hold'
    stepHoldDelay={500}
    stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
\/>
`;

export const type = 'demo';
export const configuration = { code };

export default function NumberInput_demo_hold($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				position: 'center',
				children: ($$renderer) => {
					NumberInput($$renderer, {
						label: 'Step on hold',
						description: 'Step the value when clicking and holding the arrows',
						stepHoldDelay: 500,
						stepHoldInterval: 100,
						placeholder: 'Hold the button'
					});

					$$renderer.push(`<!----> `);

					NumberInput($$renderer, {
						label: 'Step the value with interval function',
						description: 'Step value will increase incrementally when control is hold',
						stepHoldDelay: 500,
						stepHoldInterval: (t) => Math.max(1000 / t ** 2, 25),
						placeholder: 'Hold the button'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}