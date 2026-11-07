import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	let derived;

	if (derived) {
		$$renderer.push('<!--[-->');
		derived($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}