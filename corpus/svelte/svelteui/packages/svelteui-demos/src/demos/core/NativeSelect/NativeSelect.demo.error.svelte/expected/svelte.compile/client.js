import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);

export default function NativeSelect_demo_error($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	NativeSelect(node, {
		data: ['Svelte', 'Vue', 'Angular', 'React'],
		placeholder: 'Pick one',
		label: 'Select your favorite framework/library',
		error: true
	});

	var node_1 = $.sibling(node, 2);

	NativeSelect(node_1, {
		data: ['Svelte', 'Vue', 'Angular', 'React'],
		placeholder: 'Pick one',
		label: 'Select your favorite framework/library',
		error: 'Pick at least one item'
	});

	$.append($$anchor, fragment);
}