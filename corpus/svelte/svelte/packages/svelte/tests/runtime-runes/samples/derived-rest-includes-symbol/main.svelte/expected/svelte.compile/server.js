import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const symbol1 = Symbol();
	const symbol2 = Symbol();
	let a = { [symbol1]: 42 };

	Object.defineProperty(a, symbol2, { enumerable: false, value: "nope" });

	let b = $.derived(() => $.exclude_from_object(a, []));

	$$renderer.push(`<p>${$.escape(symbol1 in b())} ${$.escape(symbol2 in b())}</p>`);
}