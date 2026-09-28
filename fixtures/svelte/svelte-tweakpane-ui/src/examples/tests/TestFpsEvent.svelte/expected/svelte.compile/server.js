import * as $ from 'svelte/internal/server';
import { FpsGraph } from '$lib';

export default function TestFpsEvent($$renderer) {
	FpsGraph($$renderer, { interval: 50, label: 'FPS', max: 240, min: 0, rows: 5 });
}