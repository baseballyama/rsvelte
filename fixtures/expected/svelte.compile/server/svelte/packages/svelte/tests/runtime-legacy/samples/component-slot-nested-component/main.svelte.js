import * as $ from 'svelte/internal/server';
import Outer from './Outer.svelte';
import Inner from './Inner.svelte';

export default function Main($$renderer) {
	Outer($$renderer, {
		children: ($$renderer) => {
			Inner($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->foo`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}