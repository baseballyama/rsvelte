import * as $ from 'svelte/internal/server';

export const foo = 42;

export default function Foo($$renderer) {
	let foo = 100;

	console.log(foo);
}