import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<head></head> <body></body> <window></window> <document></document> <element></element> <options></options>`, 1);

export default function Test01_input($$anchor) {
	var fragment = root();
	var element = $.sibling($.first_child(fragment), 8);

	$.set_attribute(element, 'this', {});
	$.next(2);
	$.append($$anchor, fragment);
}