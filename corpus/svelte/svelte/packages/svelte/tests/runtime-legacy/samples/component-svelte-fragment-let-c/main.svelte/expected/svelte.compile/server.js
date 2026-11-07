import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		$$slots: {
			main: ($$renderer, { c, count }) => {
				{
					$$renderer.push(`<span>${$.escape(c)} (${$.escape(count)})</span>`);
				}
			}
		}
	});
}