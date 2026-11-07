import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const foo = {
		async bar() {
			await baz;
		},

		*qux() {
			yield 42;
		}
	};
}