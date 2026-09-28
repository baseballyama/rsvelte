import * as $ from 'svelte/internal/server';
import { Group, NumberInput } from '@svelteuidev/core';

const code = `
<script>
    import { NumberInput } from '@svelteuidev/core';
<\/script>

<NumberInput
    label='Number input with decimal steps'
    defaultValue={0.05}
    precision={2}
    min={-1}
    max={1}
    step={0.05}
\/>
`;

export const type = 'demo';
export const configuration = { code };

export default function NumberInput_demo_decimal($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			NumberInput($$renderer, {
				label: 'Number input with decimal steps',
				defaultValue: 0.05,
				precision: 2,
				min: -1,
				max: 1,
				step: 0.05
			});
		},
		$$slots: { default: true }
	});
}