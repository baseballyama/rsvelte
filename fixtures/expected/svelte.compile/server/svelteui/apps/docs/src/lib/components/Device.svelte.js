import * as $ from 'svelte/internal/server';
import { writable, derived } from 'svelte/store';

export const screenH = writable(900);
export const screenW = writable(900);
export const mobileThreshold = writable(800);
export const mobile = derived([screenW, mobileThreshold], ([$screenW, $mobileThreshold]) => $screenW < $mobileThreshold);
export const scrollY = writable(0);
export const mouse = writable({ x: 0, y: 0 });

const mouseMove = (e) => {
	mouse.update(() => ({ x: e.clientX, y: e.clientY }));
};

export default function Device($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}