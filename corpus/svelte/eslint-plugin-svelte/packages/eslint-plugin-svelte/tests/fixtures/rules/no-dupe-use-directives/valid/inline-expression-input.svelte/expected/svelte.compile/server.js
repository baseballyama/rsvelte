import * as $ from 'svelte/internal/server';

export default function Inline_expression_input($$renderer) {
	function foo() {}
	function bar() {}

	const param = {};

	$$renderer.push(`<div></div> <div></div> <div></div> <div></div>`);
}