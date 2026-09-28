import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let show = true;
	let time = 0;

	$$renderer.push(`<button></button> `);

	if (show) {
		$$renderer.push(`<!--[0--><audio></audio>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}