import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let name = 'bar';

	function foo() {
		name = 'foo';
	}

	function bar() {
		name = 'bar';
	}

	$$renderer.push(`<button>${$.escape(name)}</button>`);
}