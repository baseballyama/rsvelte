import * as $ from 'svelte/internal/server';

export default function Script_methods01_output($$renderer) {
	class A {
		a() {
			return 42;
		}

		b() {
			return 42;
		}
	}

	const o = {
		a() {
			return 42;
		},

		b() {
			return 42;
		}
	};
}