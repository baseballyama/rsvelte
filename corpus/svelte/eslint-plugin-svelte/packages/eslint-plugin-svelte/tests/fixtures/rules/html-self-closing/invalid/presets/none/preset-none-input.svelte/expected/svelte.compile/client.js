import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div></div> <!> <img/> <svg><path></path></svg> <math><msup></msup></math></div>`);

export default function Preset_none_input($$anchor) {
	var div = root();

	$.head('1k7tsrz', ($$anchor) => {});

	var node = $.sibling($.child(div), 2);

	TestComponent(node, {});
	$.next(6);
	$.reset(div);
	$.append($$anchor, div);
}