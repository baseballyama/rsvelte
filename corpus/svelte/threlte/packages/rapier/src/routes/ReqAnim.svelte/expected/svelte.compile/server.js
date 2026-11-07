import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function ReqAnim($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const originalRaf = typeof window !== 'undefined' ? window.requestAnimationFrame : () => -1;
		let isPaused = false;
		let pendingCallbacks = [];

		const monkeyPatchedRaf = (callback) => {
			if (isPaused) {
				pendingCallbacks.push(callback);

				return -1; // Return an invalid ID when paused
			} else {
				return originalRaf(callback);
			}
		};

		const pauseRaf = () => {
			if (!isPaused) {
				isPaused = true;
			}
		};

		const resumeRaf = () => {
			if (isPaused) {
				isPaused = false;
				pendingCallbacks.forEach((callback) => originalRaf(callback));
				pendingCallbacks = [];
			}
		};

		onMount(() => {
			// Monkeypatch the window.requestAnimationFrame
			window.requestAnimationFrame = monkeyPatchedRaf;
		});

		$$renderer.push(`<div style="display: flex; gap: 10px; flex-direction: column; font-family: monospace; justify-items: flex-start; align-content: flex-start; width: min-content;"><div>window.requestAnimationFrame</div> <button>${$.escape(isPaused ? 'Resume' : 'Pause')}</button></div>`);
	});
}