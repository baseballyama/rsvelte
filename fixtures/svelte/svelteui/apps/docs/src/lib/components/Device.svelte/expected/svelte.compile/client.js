import 'svelte/internal/disclose-version';
import { writable, derived } from 'svelte/store';
import * as $ from 'svelte/internal/client';

export const screenH = writable(900);
export const screenW = writable(900);
export const mobileThreshold = writable(800);
export const mobile = derived([screenW, mobileThreshold], ([$screenW, $mobileThreshold]) => $screenW < $mobileThreshold);
export const scrollY = writable(0);
export const mouse = writable({ x: 0, y: 0 });

const mouseMove = (e) => {
	mouse.update(() => ({ x: e.clientX, y: e.clientY }));
};

export default function Device($$anchor, $$props) {
	$.push($$props, true);

	const $screenH = () => $.store_get(screenH, '$screenH', $$stores);
	const $screenW = () => $.store_get(screenW, '$screenW', $$stores);
	const $scrollY = () => $.store_get(scrollY, '$scrollY', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	$.event('mousemove', $.window, (e) => mouseMove(e));
	$.bind_window_size('innerHeight', ($$value) => $.store_set(screenH, $$value));
	$.bind_window_size('innerWidth', ($$value) => $.store_set(screenW, $$value));
	$.bind_window_scroll('y', $scrollY, ($$value) => $.store_set(scrollY, $$value));
	$.pop();
	$$cleanup();
}