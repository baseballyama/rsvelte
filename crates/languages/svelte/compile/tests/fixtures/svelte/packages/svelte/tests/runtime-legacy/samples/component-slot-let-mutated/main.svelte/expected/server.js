import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	let things = [{ text: 'hello' }];

	$$renderer.push(`<button>mutate</button> `);

	Nested($$renderer, {
		things,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { thing }) => {
				$$renderer.push(`<span>${$.escape(thing.text)}</span>`);
			}
		}
	});

	$$renderer.push(`<!---->`);
}