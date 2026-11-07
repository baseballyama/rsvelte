import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (Whatever) {
		$$renderer.push('<!--[-->');
		Whatever($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}