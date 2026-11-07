import * as $ from 'svelte/internal/server';
import MyComponent from './MyComponent.svelte';

export default function Style_ptops_test_input($$renderer) {
	let color = 'red';

	$.css_props($$renderer, true, { '--b': color, '--a': color }, () => {
		MyComponent($$renderer, {});
	});
}