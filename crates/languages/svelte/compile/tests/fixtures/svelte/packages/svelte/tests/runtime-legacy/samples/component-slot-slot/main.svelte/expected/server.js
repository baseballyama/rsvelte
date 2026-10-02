import * as $ from 'svelte/internal/server';
import Forward from './Forward.svelte';

export default function Main($$renderer) {
	Forward($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<span>lol</span>`);
		},
		$$slots: { default: true }
	});
}