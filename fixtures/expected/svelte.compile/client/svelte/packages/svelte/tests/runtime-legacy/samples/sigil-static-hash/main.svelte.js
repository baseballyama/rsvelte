import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	$.next();

	var text = $.text('#foo');

	$.append($$anchor, text);
}