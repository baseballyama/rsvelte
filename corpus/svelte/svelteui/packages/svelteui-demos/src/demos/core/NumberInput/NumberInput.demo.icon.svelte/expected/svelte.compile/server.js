import * as $ from 'svelte/internal/server';
import { Group, NumberInput } from '@svelteuidev/core';
import { Star } from 'radix-icons-svelte';

const code = `
<script>
    import { NumberInput } from '@svelteuidev/core';
    import { Star } from 'radix-icons-svelte';
<\/script>

<NumberInput
    label='Number input with decimal steps'
    defaultValue={0.05}
    precision={2}
    min={-1}
    max={1}
    icon={Star}
\/>
`;

export const type = 'demo';
export const configuration = { code };

export default function NumberInput_demo_icon($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			NumberInput($$renderer, {
				label: 'Number input with decimal steps',
				defaultValue: 0.05,
				precision: 2,
				min: -1,
				max: 1,
				step: 0.05,
				icon: Star
			});
		},
		$$slots: { default: true }
	});
}