import * as $ from 'svelte/internal/server';

export default function _1_input($$renderer) {
	if (expression) {
		$$renderer.push('<!--[-->');
		expression($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}