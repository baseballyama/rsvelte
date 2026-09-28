import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child($$anchor) {
	let scrollY;

	$.bind_window_scroll('y', () => scrollY, ($$value) => scrollY = $$value);
}