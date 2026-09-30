import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="big svelte-59lghn">text</p> <span class="svelte-59lghn">plain</span>`, 1);

export default function Styled_svue($$anchor) {
	let size = 'big';
	var fragment = root();
	var p = $.first_child(fragment);

	$.set_attribute(p, 'data-size', size);
	$.next(2);
	$.append($$anchor, fragment);
}