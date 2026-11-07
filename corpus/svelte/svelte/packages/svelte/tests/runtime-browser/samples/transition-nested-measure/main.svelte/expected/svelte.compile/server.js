import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	let visible = false;

	$$renderer.push(`<button>toggle</button> `);

	if (visible) {
		$$renderer.push('<!--[0-->');
		Nested($$renderer, { depth: 2 });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}