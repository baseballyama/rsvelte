import * as $ from 'svelte/internal/server';
import Foo from './Foo.svelte';

export default function Main($$renderer) {
	let x = 2;

	Foo($$renderer, { internal: x });
	$$renderer.push(`<!----> <button>click me</button>`);
}