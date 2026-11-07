import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Ts_directive_comment($$anchor) {
	$.next();

	var text = $.text('//@');

	$.append($$anchor, text);
	//@
}