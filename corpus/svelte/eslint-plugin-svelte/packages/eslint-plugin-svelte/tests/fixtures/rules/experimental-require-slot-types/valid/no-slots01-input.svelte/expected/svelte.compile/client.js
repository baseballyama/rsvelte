import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function No_slots01_input($$anchor) {
	$.next();

	var text = $.text('content');

	$.append($$anchor, text);
}