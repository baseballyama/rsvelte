import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const promise = Promise.reject('Test');
	let toggle = false;

	$$renderer.push(`<button>toggle</button> `);

	if (toggle) {
		$$renderer.push('<!--[0-->');
		$.await($$renderer, promise, () => {}, () => {});
		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}