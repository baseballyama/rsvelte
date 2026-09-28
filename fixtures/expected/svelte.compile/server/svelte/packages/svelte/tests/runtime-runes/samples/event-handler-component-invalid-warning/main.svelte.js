import * as $ from 'svelte/internal/server';
import Button from './Button.svelte';

export default function Main($$renderer) {
	let count = 0;

	Button($$renderer, {
		onclick: count++,
		children: ($$renderer) => {
			$$renderer.push(`<!---->clicks: ${$.escape(count)}`);
		},
		$$slots: { default: true }
	});
}