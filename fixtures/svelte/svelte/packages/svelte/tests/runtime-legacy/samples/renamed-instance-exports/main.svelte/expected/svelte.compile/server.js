import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	const foo1 = 42;
	let foo2 = 42;

	$.bind_props($$props, { bar1: foo1, bar2: foo2 });
}