import * as $ from 'svelte/internal/server';

function foo($$renderer, o) {
	$$renderer.push(`<button>Click me</button>`);
}

export default function Ts_snippet03_input($$renderer) {
	function hello() {
		console.log('Hello');
	}

	foo($$renderer, { onclick: hello });
}