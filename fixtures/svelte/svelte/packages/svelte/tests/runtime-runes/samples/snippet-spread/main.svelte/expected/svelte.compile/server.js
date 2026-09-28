import * as $ from 'svelte/internal/server';
import Button from './Button.svelte';

export default function Main($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->hello`);
		},
		$$slots: { default: true }
	});
}