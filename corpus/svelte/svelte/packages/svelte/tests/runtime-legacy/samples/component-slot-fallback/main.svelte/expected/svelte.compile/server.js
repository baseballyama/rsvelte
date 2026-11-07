import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<p>not fallback</p>`);
		},
		$$slots: { default: true }
	});
}