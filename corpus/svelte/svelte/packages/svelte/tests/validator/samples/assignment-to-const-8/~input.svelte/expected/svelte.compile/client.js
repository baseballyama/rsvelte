import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	const arr = [1, 2];

	[arr[0], arr[1] = arr] = [arr[1], arr[0]];
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, arr));
	$.append($$anchor, text);
}