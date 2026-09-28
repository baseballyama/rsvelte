import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let offset = 1;

	function* count(offset) {
		let i = offset;

		while (true) yield i++;
	}

	let $$d = $.derived(() => count(offset)),
		$$derived_array = $.derived(() => $.to_array($$d(), 3)),
		a = $.derived(() => $$derived_array()[0]),
		b = $.derived(() => $$derived_array()[1]),
		c = $.derived(() => $$derived_array()[2]);

	$$renderer.push(`<button>increment</button> <p>a: ${$.escape(a())}</p> <p>b: ${$.escape(b())}</p> <p>c: ${$.escape(c())}</p>`);
}