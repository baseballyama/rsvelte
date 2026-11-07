import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function NumberInput_demo_decimal($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			NumberInput($$anchor, {
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