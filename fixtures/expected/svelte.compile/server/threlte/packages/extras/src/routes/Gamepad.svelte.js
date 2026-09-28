import * as $ from 'svelte/internal/server';
import { onDestroy, onMount } from 'svelte';

export default function Gamepad($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let sim;

		onMount(async () => {
			sim = (await import('./gamepadSimulator.js')).default;
			sim.create();
			sim.connect();
		});

		onDestroy(() => {
			if (!sim) return;

			sim.disconnect();
			sim.destroy();
		});
	});
}