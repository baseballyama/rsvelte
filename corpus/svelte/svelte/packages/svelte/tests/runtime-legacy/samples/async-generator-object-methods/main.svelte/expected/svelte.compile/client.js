import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	const foo = {
		async bar() {
			await baz;
		},

		*qux() {
			yield 42;
		}
	};
}