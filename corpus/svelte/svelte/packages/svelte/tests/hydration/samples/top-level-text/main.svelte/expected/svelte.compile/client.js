import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	$.next();

	var text = $.text('Text');

	$.append($$anchor, text);
}