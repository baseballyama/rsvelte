import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Class01_input($$anchor) {
	class A {}

	class B extends A {
		// private t: T
		fn() {}

		get a() {
			return 42;
		}

		*gen(s) {}
	}
}