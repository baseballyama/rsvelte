import * as $ from 'svelte/internal/server';
import { Group, NumberInput } from '@svelteuidev/core';

const code = `
<script>
    import { NumberInput } from '@svelteuidev/core';
<\/script>

<NumberInput
    label='Number input with a custom decimal separator'
    decimalSeparator=','
    defaultValue={0.5}
    precision={2}
    step={0.5}
\/>
`;

export const type = 'demo';
export const configuration = { code };

export default function NumberInput_demo_separator($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			NumberInput($$renderer, {
				label: 'Number input with a custom decimal separator',
				decimalSeparator: ',',
				defaultValue: 0.5,
				precision: 2,
				step: 0.5
			});
		},
		$$slots: { default: true }
	});
}