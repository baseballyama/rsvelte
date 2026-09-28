import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		$$slots: {
			main: ($$renderer, { foo: bar }) => {
				{
					$$renderer.push(`<p>${$.escape(bar)}</p>`);
				}
			}
		}
	});
}