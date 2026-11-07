import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function bar() {
			class Foo {
				foo = 0;
			}

			const a = new Foo();
		}
	});
}