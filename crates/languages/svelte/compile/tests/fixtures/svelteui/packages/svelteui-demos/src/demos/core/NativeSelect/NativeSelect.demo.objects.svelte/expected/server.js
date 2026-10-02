import * as $ from 'svelte/internal/server';
import { NativeSelect } from '@svelteuidev/core';

const code = `<script>
    import { NativeSelect } from '@svelteuidev/core';
<\/script>

<NativeSelect
    data={[
      { label: 'Svelte', value: 'svelte' },
      { label: 'Vue', value: 'vue' },
      { label: 'Angular', value: 'angular' },
      { label: 'JQuery', value: 'jquery', disabled: true },
      { label: 'React', value: 'react' }
    ]}
    placeholder="Pick one"
    label="Select your favorite framework/library"
/>`;

export const type = 'demo';
export const configuration = { code };

export default function NativeSelect_demo_objects($$renderer) {
	NativeSelect($$renderer, {
		data: [
			{ label: 'Svelte', value: 'svelte' },
			{ label: 'Vue', value: 'vue' },
			{ label: 'Angular', value: 'angular' },
			{ label: 'JQuery', value: 'jquery', disabled: true },
			{ label: 'React', value: 'react' }
		],
		placeholder: 'Pick one',
		label: 'Select your favorite framework/library'
	});
}