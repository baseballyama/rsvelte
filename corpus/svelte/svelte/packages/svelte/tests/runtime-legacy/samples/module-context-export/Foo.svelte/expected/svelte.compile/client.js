import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export const foo = 42;

export default function Foo($$anchor) {
	let foo = 100;

	console.log(foo);
}