import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let x = 0;

		function foo() {
			(() => {
				for (let x = 0; x < 10; x++) {}

				x = 42;
			})();
		}

		$$renderer.push(`<button>foo</button> <p>x: ${$.escape(x)}</p>`);
	});
}