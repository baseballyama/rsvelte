import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let foo1;
	let foo2;

	for (let bar = foo1 = 0; bar < 5; bar += 1) {
		foo2 = foo1;
	}

	function a() {
		for (let bar = foo1 = 0; bar < 5; bar += 1) {
			foo2 = foo1;
		}
	}

	$$renderer.push(`<h1>${$.escape(foo1)} ${$.escape(foo2)}</h1>`);
}