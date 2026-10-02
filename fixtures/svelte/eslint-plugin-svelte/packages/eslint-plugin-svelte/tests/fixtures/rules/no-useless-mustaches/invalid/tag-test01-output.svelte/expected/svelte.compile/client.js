import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Tag_test01_output($$anchor) {
	$.next();

	var text = $.text('<br>');

	$.append($$anchor, text);
}