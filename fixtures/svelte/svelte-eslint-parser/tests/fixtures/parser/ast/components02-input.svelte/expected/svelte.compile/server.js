import * as $ from 'svelte/internal/server';
import MyComponent from './MyComponent.svelte';

export default function Components02_input($$renderer) {
	MyComponent($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->contents<div></div>`);
		},
		$$slots: { default: true }
	});
}