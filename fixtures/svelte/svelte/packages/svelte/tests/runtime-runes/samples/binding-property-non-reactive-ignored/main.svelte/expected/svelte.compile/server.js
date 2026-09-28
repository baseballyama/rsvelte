import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let arr = [];

	if (undefined) {
		$$renderer.push('<!--[-->');
		undefined($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}