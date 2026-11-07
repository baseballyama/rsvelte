import * as $ from 'svelte/internal/server';
import { NativeSelect } from '@svelteuidev/core';

const code = `<script>
    import { NativeSelect } from '@svelteuidev/core';
<\/script>

<NativeSelect
    data={['Svelte', 'Vue', 'Angular', 'React']}
    placeholder="Pick one"
    label="Select your favorite framework/library"
    error
/>
<NativeSelect
    data={['Svelte', 'Vue', 'Angular', 'React']}
    placeholder="Pick one"
    label="Select your favorite framework/library"
    error="Pick at least one item"
/>`;

export const type = 'demo';
export const configuration = { code };

export default function NativeSelect_demo_error($$renderer) {
	NativeSelect($$renderer, {
		data: ['Svelte', 'Vue', 'Angular', 'React'],
		placeholder: 'Pick one',
		label: 'Select your favorite framework/library',
		error: true
	});

	$$renderer.push(`<!----> `);

	NativeSelect($$renderer, {
		data: ['Svelte', 'Vue', 'Angular', 'React'],
		placeholder: 'Pick one',
		label: 'Select your favorite framework/library',
		error: 'Pick at least one item'
	});

	$$renderer.push(`<!---->`);
}