import * as $ from 'svelte/internal/server';
import { BodyScrollLock } from "$lib/internal/body-scroll-lock.svelte.js";

export default function Scroll_lock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { preventScroll = true, restoreScrollDelay = null } = $$props;

		if (preventScroll) {
			new BodyScrollLock(preventScroll, () => restoreScrollDelay);
		}
	});
}