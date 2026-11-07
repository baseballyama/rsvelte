import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Hello`);
		},
		$$slots: { default: true }
	});
}