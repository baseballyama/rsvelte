import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BodyScrollLock } from "$lib/internal/body-scroll-lock.svelte.js";

export default function Scroll_lock($$anchor, $$props) {
	$.push($$props, true);

	let preventScroll = $.prop($$props, 'preventScroll', 3, true),
		restoreScrollDelay = $.prop($$props, 'restoreScrollDelay', 3, null);

	if (preventScroll()) {
		new BodyScrollLock(preventScroll(), () => restoreScrollDelay());
	}

	$.pop();
}