import * as $ from 'svelte/internal/server';
import Slot from './slot.svelte';

export default function Main($$renderer) {
	Slot($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<p>bar</p>`);
		},
		$$slots: { default: true }
	});
}