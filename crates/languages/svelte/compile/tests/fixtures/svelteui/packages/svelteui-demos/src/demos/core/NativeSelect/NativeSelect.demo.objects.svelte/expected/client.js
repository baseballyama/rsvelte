import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function NativeSelect_demo_objects($$anchor) {
	NativeSelect($$anchor, {
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