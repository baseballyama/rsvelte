import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	function myHandler() {}
	function foo() {}
	function bar() {}

	$$renderer.push(`<button></button> <button></button>`);
}