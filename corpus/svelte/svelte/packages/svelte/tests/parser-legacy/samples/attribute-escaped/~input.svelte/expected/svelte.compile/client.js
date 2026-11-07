import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div data-foo="semi:&quot;space:&quot; letter:&amp;quote number:&amp;quot1 end:&quot;"></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}