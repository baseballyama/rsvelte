import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`.<input checked=""/>`, 1);

export default function Main($$anchor) {
	$.next();

	var fragment = root();
	var input = $.sibling($.first_child(fragment));

	$.remove_input_defaults(input);
	$.append($$anchor, fragment);
}