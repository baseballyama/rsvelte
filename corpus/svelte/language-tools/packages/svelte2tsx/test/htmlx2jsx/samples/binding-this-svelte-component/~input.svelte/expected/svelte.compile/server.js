import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (A) {
		$$renderer.push('<!--[-->');
		A($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}