import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	if (currentSelection.component) {
		$$renderer.push('<!--[-->');
		currentSelection.component($$renderer, { foo: bar });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}