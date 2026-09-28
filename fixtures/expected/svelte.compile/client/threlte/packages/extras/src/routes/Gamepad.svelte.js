import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy, onMount } from 'svelte';

export default function Gamepad($$anchor, $$props) {
	$.push($$props, true);

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

	$.pop();
}