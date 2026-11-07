import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div></div> <img/> <!> <svg><path></path></svg> <math><msup></msup></math></div>`);

export default function Preset_html_output($$anchor) {
	var div = root();

	$.head('gbykey', ($$anchor) => {});

	var node = $.sibling($.child(div), 4);

	TestComponent(node, {});
	$.next(4);
	$.reset(div);
	$.append($$anchor, div);
}