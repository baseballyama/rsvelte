import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<iframe src=""></iframe>`);

export default function Input($$anchor) {
	var iframe = root();

	$.append($$anchor, iframe);
}