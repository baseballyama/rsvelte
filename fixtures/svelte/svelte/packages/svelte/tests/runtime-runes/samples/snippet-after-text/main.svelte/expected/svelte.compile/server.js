import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	Child($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->123`);
		},
		$$slots: { default: true }
	});
}