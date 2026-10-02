import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let foo = true;

	bar;

	function bar($$renderer) {
		$$renderer.push(`<!---->hello true`);
	}
}