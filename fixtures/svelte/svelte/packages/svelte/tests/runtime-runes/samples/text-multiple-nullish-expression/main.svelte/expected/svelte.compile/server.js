import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function fn() {}

	$$renderer.push(`<li>${$.escape(fn())}</li>`);
}