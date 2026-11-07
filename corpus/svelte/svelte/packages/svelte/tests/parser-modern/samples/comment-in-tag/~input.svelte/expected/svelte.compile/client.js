import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div data-one="1" data-two="2" data-three="3"></div> <span data-one="1"></span>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}