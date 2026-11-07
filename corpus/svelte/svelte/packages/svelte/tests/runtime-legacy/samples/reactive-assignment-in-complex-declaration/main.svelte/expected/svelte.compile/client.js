import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1>`);

export default function Main($$anchor) {
	let eid = 1;
	let foo;
	let employees = [{ id: eid = foo = 2, name: 'xxx' }];
	var h1 = root();
	var text = $.only_child(h1);

	$.template_effect(() => $.set_text(text, `${foo ?? ''} ${eid ?? ''}`));
	$.append($$anchor, h1);
}