import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

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
	$.pop();
}