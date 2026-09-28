import * as $ from 'svelte/internal/server';
import Test from './Test.svelte';

export default function Main($$renderer) {
	Test($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Test`);
		},
		$$slots: { default: true }
	});
}