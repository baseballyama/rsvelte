import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	// svelte-ignore non_reactive_update
	let value;

	value = "";
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, value));
	$.append($$anchor, text);
}