import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { c, count }) => {
				$$renderer.push(`<span>${$.escape(c)} (${$.escape(count)})</span>`);
			}
		}
	});
}