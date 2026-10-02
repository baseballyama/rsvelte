import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (MyComponent) {
		$$renderer.push('<!--[-->');
		MyComponent($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}