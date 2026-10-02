import * as $ from 'svelte/internal/server';
import A from './A.svelte';

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