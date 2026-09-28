import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function test($$renderer) {}

	$$renderer.push(`<div><span>something</span></div>`);
}