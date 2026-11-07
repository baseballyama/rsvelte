import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child($$anchor) {
	$.next();

	var text = $.text('Child');

	$.append($$anchor, text);
}