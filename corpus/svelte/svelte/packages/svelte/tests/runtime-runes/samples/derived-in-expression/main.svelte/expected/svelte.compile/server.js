import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let object = { a: 0, b: 0 };

		function a() {
			console.log('a');

			return object.a;
		}

		function b() {
			console.log('b');

			let double = $.derived(() => object.b);

			return double();
		}

		$$renderer.push(`<button>a</button> <button>b</button> <p>${$.escape(a())}/${$.escape(b())}</p>`);
	});
}