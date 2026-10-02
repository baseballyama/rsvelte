import * as $ from 'svelte/internal/server';

export default function Inline_expression_input($$renderer) {
	function foo() {}
	function bar() {}

	$$renderer.push(`<button></button> <button></button>`);
}