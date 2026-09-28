import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<ul><li>a</li><li>b</li><li>c</li></ul>`);

export default function Input($$anchor) {
	var ul = root();

	$.append($$anchor, ul);
}