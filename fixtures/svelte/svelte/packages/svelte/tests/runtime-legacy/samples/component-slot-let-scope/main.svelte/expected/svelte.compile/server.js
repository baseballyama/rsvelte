import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		$$slots: {
			thing: ($$renderer) => {
				{
					$$renderer.push(`<span>${$.escape(thing)}</span>`);
				}
			}
		}
	});
}