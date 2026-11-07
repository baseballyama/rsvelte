import * as $ from 'svelte/internal/server';
import { NativeSelect } from '@svelteuidev/core';

const code = `<script>
    import { NativeSelect } from '@svelteuidev/core';
<\/script>

<NativeSelect data={['Svelte', 'Vue', 'Angular', 'React']} label="Disabled select" disabled />`;

export const type = 'demo';
export const configuration = { code };

export default function NativeSelect_demo_disabled($$renderer) {
	NativeSelect($$renderer, {
		data: ['Svelte', 'Vue', 'Angular', 'React'],
		label: 'Disabled select',
		disabled: true
	});
}