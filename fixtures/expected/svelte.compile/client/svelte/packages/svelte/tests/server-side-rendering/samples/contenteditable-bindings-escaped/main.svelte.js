import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div contenteditable=""></div> <div contenteditable=""></div> <div contenteditable=""></div>`, 1);

export default function Main($$anchor) {
	let data = $.state("<scri" + "pt>alert('pwnd')</scr" + "ipt>");
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);
	var div_2 = $.sibling(div_1, 2);

	$.bind_content_editable('innerText', div, () => $.get(data), ($$value) => $.set(data, $$value));
	$.bind_content_editable('textContent', div_1, () => $.get(data), ($$value) => $.set(data, $$value));
	$.bind_content_editable('innerHTML', div_2, () => $.get(data), ($$value) => $.set(data, $$value));
	$.append($$anchor, fragment);
}