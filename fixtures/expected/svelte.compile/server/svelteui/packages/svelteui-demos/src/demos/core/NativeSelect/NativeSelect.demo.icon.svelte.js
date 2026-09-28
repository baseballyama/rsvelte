import * as $ from 'svelte/internal/server';
import { NativeSelect } from '@svelteuidev/core';
import { StarFilled } from 'radix-icons-svelte';

const code = `<script>
    import { NativeSelect } from '@svelteuidev/core';
    import { StarFilled } from 'radix-icons-svelte';
<\/script>

<NativeSelect
    data={['Svelte', 'Vue', 'Angular', 'React']}
    label="Pick the best"
    icon={StarFilled}
/>`;

export const type = 'demo';
export const configuration = { code };

export default function NativeSelect_demo_icon($$renderer) {
	NativeSelect($$renderer, {
		data: ['Svelte', 'Vue', 'Angular', 'React'],
		label: 'Pick the best',
		icon: StarFilled,
		override: { '.withIcon': { pl: '40px !important' } }
	});
}