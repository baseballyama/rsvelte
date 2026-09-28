import * as $ from 'svelte/internal/server';
import UnrenderedChildren from './unrendered-children.svelte';

export default function Main($$renderer) {
	UnrenderedChildren($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Hi`);
		},
		$$slots: { default: true }
	});
}