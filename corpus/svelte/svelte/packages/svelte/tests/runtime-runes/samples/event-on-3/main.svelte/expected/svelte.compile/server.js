import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function f() {}

	$$renderer.push(`<input/>${$.escape(f)}`);
}