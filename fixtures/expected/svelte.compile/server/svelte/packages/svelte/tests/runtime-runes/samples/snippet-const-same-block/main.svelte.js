import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	if (true) {
		$$renderer.push('<!--[0-->');

		const xx = test;

		function test($$renderer) {}
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}