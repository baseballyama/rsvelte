import * as $ from 'svelte/internal/server';
import Empty from './Empty.svelte';

export default function Main($$renderer) {
	let active = true;

	$$renderer.push(`<button>destroy component</button> `);

	if (active ? Empty : null) {
		$$renderer.push('<!--[-->');
		(active ? Empty : null)($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}