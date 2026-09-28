import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		things: [1, 2],
		$$slots: {
			foo: ($$renderer, { thing }) => {
				const props = { thing };

				$$renderer.push(`<div slot="foo"><span>${$.escape(props.thing)}</span></div>`);
			}
		}
	});
}