import * as $ from 'svelte/internal/server';
import MyComponent from './MyComponent.svelte';

export default function Style_ptops_test_output($$renderer) {
	let color = 'red';

	$.css_props($$renderer, true, { '--a': color, '--b': color }, () => {
		MyComponent($$renderer, {});
	});
}