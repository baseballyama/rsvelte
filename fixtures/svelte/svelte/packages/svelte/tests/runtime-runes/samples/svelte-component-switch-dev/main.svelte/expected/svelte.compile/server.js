import * as $ from 'svelte/internal/server';
import A from './A.svelte';
import B from './B.svelte';

export default function Main($$renderer) {
	let component = A;

	$$renderer.push(`<button>switch</button> `);

	if (component) {
		$$renderer.push('<!--[-->');
		component($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}