import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	if (true) {
		$$renderer.push('<!--[0-->');

		const a = b;
		const b = a;

		$$renderer.push(`<h1>hello </h1>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}