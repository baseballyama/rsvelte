import * as $ from 'svelte/internal/server';

export default function $derived_input($$renderer) {
	let x = { foo: 42 };
	const get = () => "hello";

	x = null;

	const y = $.derived(() => x);
	const z = $.derived(() => fn(y().foo));
	const foo = $.derived(() => get);

	function fn(a) {
		return a;
	}

	$$renderer.push(`<input${$.attr('title', z())}${$.attr('value', x)}/> ${$.escape(foo()())}`);
}