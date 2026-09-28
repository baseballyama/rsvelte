import * as $ from 'svelte/internal/server';
import { Center, NumberInput, Stack } from '@svelteuidev/core';

const code = `
<script>
    import { NumberInput } from '@svelteuidev/core';
<\/script>

<NumberInput
    label='Your age'
    placeholder='Your age'
    description='From 0 to 120, step is 1'
    min={0}
    max={120}
\/>
<NumberInput
    label='Your weight in kg'
    placeholder='Your weight'
    description='From 0 to infinity, step is 5'
    min={0}
    step={5}
\/>
`;

export const type = 'demo';
export const configuration = { code };

export default function NumberInput_demo_minmax($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				position: 'center',
				children: ($$renderer) => {
					NumberInput($$renderer, {
						label: 'Your age',
						placeholder: 'Your age',
						description: 'From 0 to 120, step is 1',
						min: 0,
						max: 120
					});

					$$renderer.push(`<!----> `);

					NumberInput($$renderer, {
						label: 'Your weight in kg',
						placeholder: 'Your weight',
						description: 'From 0 to infinity, step is 5',
						min: 0,
						step: 5
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}