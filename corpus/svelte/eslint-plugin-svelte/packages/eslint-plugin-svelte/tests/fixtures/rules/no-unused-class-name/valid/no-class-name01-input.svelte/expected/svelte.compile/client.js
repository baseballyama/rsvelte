import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>Hello</div> <span>World!</span>`, 1);

export default function No_class_name01_input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}