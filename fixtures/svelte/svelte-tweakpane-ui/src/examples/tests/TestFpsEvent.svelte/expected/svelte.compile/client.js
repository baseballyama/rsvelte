import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FpsGraph } from '$lib';

export default function TestFpsEvent($$anchor) {
	FpsGraph($$anchor, {
		interval: 50,
		label: 'FPS',
		max: 240,
		min: 0,
		rows: 5,
		$$events: { change: (value) => console.log(value) }
	});
}