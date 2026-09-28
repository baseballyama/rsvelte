import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';
import Hello from './Hello.svelte';

export default function Main($$renderer) {
	let name = 'world';

	Nested($$renderer, {
		$$slots: {
			name: ($$renderer) => {
				Hello($$renderer, { slot: 'name', name });
			}
		}
	});
}