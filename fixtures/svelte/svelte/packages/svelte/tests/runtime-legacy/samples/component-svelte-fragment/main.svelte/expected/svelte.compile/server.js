import * as $ from 'svelte/internal/server';
import Nested from "./Nested.svelte";
import B from './B.svelte';

export default function Main($$renderer) {
	const a = 'a';

	Nested($$renderer, {
		$$slots: {
			a: ($$renderer) => {
				{
					$$renderer.push(`content <span>a</span>`);
				}
			},

			b: ($$renderer) => {
				{
					B($$renderer, { name: 'world' });
				}
			}
		}
	});
}