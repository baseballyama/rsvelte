import * as $ from 'svelte/internal/server';

export default function Use_test_output($$renderer) {
	function a() {}
	function b() {}

	$$renderer.push(`<div></div>`);
}