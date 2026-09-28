import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><p>This text should be red with a class of foo</p></div>`);

export default function Main($$anchor) {
	var div = root();
	var p = $.child(div);

	$.set_class(p, 1, '', null, {}, { foo: true });
	$.set_style(p, '', {}, { color: 'red' });
	$.reset(div);
	$.append($$anchor, div);
}