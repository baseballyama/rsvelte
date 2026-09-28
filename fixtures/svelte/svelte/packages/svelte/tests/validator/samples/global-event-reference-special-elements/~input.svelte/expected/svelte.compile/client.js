import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	let onkeydown;

	$.event('keydown', $.window, onkeydown);
	$.event('resize', $.window, onresize);
	$.event('visibilitychange', $.document, onvisibilitychange);
	$.event('focus', $.document.body, onfocus);
}