import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	$.next();

	var text = $.text('Hello & World');

	$.append($$anchor, text);
}