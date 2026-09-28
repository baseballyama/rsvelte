import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function NativeSelect_demo_icon($$anchor) {
	NativeSelect($$anchor, {
		data: ['Svelte', 'Vue', 'Angular', 'React'],
		label: 'Pick the best',
		get icon() {
			return StarFilled;
		},
		override: { '.withIcon': { pl: '40px !important' } }
	});
}