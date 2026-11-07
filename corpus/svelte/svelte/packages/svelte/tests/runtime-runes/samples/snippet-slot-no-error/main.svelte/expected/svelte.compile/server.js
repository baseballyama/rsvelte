import * as $ from 'svelte/internal/server';
import Inner from './inner.svelte';

export default function Main($$renderer) {
	Inner($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->I don't need to use the argument if I don't want to`);
		},
		$$slots: { default: true }
	});
}