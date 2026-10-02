import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function doSomething() {}

		function doSomething2() {
			function somethingElse() {}
		}

		(function () {
			function doSomething() {}
		})();

		if (test) {
			var fn = function () {};
		}

		if (test) {
			var fn = function expr() {};
		}

		function decl() {
			var fn = function expr() {};
		}

		function decl2(arg) {
			var fn;

			if (arg) {
				fn = function () {};
			}
		}
	});
}