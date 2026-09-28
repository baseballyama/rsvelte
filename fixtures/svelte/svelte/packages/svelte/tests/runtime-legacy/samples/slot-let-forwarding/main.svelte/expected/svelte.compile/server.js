import * as $ from 'svelte/internal/server';
import Outer from './outer.svelte';

export default function Main($$renderer) {
	Outer($$renderer, {
		$$slots: {
			x: ($$renderer, { foo }) => {
				$$renderer.push(`<div slot="x">${$.escape(foo)}</div>`);
			}
		}
	});
}