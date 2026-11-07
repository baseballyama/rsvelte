import * as $ from 'svelte/internal/server';

export default function Script_function01_input($$renderer) {
	([a, b]) => a + b;

	function fn(a, b) {
		a + b;
	}

	f = function (a, b) {
		a + b;
	};

	o = {
		fn(a, b) {
			a + b;
		}
	};
}