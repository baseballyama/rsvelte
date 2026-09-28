import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function test() {
			try {
				throw new TypeError("oops1");
			} catch(error) {
				console.log(error);
			}

			try {
				throw new TypeError("oops2");
			} catch(error) {
				console.log(error);
			}
		}

		test();
	});
}