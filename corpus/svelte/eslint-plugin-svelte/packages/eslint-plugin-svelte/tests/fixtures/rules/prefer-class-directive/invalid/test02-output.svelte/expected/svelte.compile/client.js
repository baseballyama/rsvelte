import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button>`);

export default function Test02_output($$anchor) {
	let a = true;
	let b = true;
	let c = true;
	let d = true;
	var button = root();

	$.set_class(button, 1, ' a   d', null, {}, { c, 'no-c': !c });
	$.append($$anchor, button);
}