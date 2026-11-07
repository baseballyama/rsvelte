import * as $ from 'svelte/internal/server';

function foo($$renderer, a) {
	$$renderer.push(`<!---->${$.escape(a.foo)} ${$.escape(a.bar)}`);
}

export default function Main($$renderer) {
	let el = { foo: 'foo', bar: 'bar' };

	function fn(el) {
		console.log('invoked');

		return el;
	}

	foo($$renderer, fn(el));
}