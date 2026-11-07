import * as $ from 'svelte/internal/server';

export default function Class01_input($$renderer) {
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