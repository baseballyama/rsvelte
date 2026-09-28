import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NativeSelect } from '@svelteuidev/core';

const code = `<script>
    import { NativeSelect } from '@svelteuidev/core';
<\/script>

<NativeSelect data={['Svelte', 'Vue', 'Angular', 'React']} label="Disabled select" disabled />`;

export const type = 'demo';
export const configuration = { code };

export default function NativeSelect_demo_disabled($$anchor) {
	NativeSelect($$anchor, {
		data: ['Svelte', 'Vue', 'Angular', 'React'],
		label: 'Disabled select',
		disabled: true
	});
}