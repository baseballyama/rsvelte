import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Script_function01_output($$anchor) {
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