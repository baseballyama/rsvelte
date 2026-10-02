import * as $ from 'svelte/internal/server';
import Button from './Button.svelte';

export default function Main($$renderer) {
	let count = 0;

	function increment() {
		count += 1;
	}

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->clicks: ${$.escape(count)}`);
		},
		$$slots: { default: true }
	});
}