import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p contenteditable="true"></p> <p contenteditable="true"></p> <p contenteditable="true"></p>`, 1);

export default function Input($$anchor) {
	let text = 'Hello world';
	var fragment = root();
	var p = $.first_child(fragment);
	var p_1 = $.sibling(p, 2);
	var p_2 = $.sibling(p_1, 2);

	$.bind_content_editable('textContent', p, () => text, ($$value) => text = $$value);
	$.bind_content_editable('innerHTML', p_1, () => text, ($$value) => text = $$value);
	$.bind_content_editable('innerHTML', p_2, () => text, ($$value) => text = $$value);
	$.append($$anchor, fragment);
}