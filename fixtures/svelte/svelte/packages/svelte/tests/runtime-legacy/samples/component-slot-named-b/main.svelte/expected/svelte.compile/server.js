import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	let name = 'world';

	Nested($$renderer, {
		$$slots: {
			name: ($$renderer) => {
				$$renderer.push(`<span slot="name">Hello world</span>`);
			}
		}
	});
}