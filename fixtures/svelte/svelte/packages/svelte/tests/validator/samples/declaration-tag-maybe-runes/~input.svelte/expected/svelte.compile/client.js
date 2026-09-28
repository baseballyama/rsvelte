import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	let name = 'world';
	const foo = world;

	$.next();

	var text = $.text('Usage when no explicit runes/legacy mode should be ok');

	$.append($$anchor, text);
}