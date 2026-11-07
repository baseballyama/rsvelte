import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Foo {
			foo = 0;
		}

		function bar() {
			const a = new Foo();
		}
	});
}