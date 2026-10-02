import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const object = { foo: { bar: { baz: 1 } } };

	$$renderer.push(`<button>${$.escape(object.foo.bar.baz)}</button> <button>double</button>`);
}