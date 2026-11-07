import * as $ from 'svelte/internal/server';

export default function Foo($$renderer) {
	let x = 'yes';

	$$renderer.push(`<p>Foo: yes</p>`);
}