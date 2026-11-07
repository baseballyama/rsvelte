import * as $ from 'svelte/internal/server';
import * as Nested from './Nested.svelte';

export default function Components04_input($$renderer) {
	if (Nested.default) {
		$$renderer.push('<!--[-->');
		Nested.default($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}