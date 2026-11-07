import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function bar() {
			const a = new (class Foo {
				foo = 0;
			})();
		}
	});
}