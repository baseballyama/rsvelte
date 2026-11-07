import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	let count = 42;

	Nested($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { count }) => {
				$$renderer.push(`<p>count in default slot: ${$.escape(count)}</p>`);
			},

			foo: ($$renderer, { count }) => {
				$$renderer.push(`<p slot="foo">count in foo slot: ${$.escape(count)}</p>`);
			},

			bar: ($$renderer) => {
				$$renderer.push(`<p slot="bar">count in bar slot: 42</p>`);
			}
		}
	});
}