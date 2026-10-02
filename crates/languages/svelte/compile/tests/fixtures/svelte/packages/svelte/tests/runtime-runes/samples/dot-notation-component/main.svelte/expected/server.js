import * as $ from 'svelte/internal/server';
import child from './child.svelte';

export default function Main($$renderer) {
	const components = { child };

	if (components.child) {
		$$renderer.push('<!--[-->');
		components.child($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}