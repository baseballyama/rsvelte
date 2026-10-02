import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const hoge = {};
	const { foo: { bar } = {} } = hoge;
	const hoge2 = {};
	const { foo2: { bar2 } = { bar2: "bar2" } } = hoge2;

	$$renderer.push(`<div>hello ${$.escape(bar)}</div> <div>hello ${$.escape(bar2)}</div>`);
}