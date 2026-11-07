import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let abc = 'a';

	function a($$renderer) {
		$$renderer.push(`<!---->a`);
	}

	function b($$renderer) {
		a($$renderer);
	}

	b($$renderer);
}