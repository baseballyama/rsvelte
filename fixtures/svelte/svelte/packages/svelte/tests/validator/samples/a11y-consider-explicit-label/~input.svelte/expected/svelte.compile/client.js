import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var select_content = $.from_html(`<button><selectedcontent></selectedcontent></button><option>one</option><option>two</option><option>three</option>`, 1);
var root = $.from_html(`<button></button> <a href="/#"><b></b></a> <button aria-label="Valid empty button"></button> <a href="/#" aria-label="Valid empty link"></a> <button title="Valid empty button"></button> <a href="/#" title="Valid empty link"></a> <button aria-hidden="true"></button> <button inert=""></button> <a href="/#" aria-hidden="true"><b></b></a> <button>Click me</button> <a href="/#">Link text</a> <a href="/#"><img src="./icon.svg" alt="Link text"/></a> <select><!></select>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var select = $.sibling($.first_child(fragment), 24);

	$.customizable_select(select, () => {
		var anchor = $.child(select);
		var fragment_1 = select_content();
		var button = $.first_child(fragment_1);
		var selectedcontent = $.child(button);

		$.selectedcontent(selectedcontent, ($$element) => selectedcontent = $$element);
		$.reset(button);
		$.next(3);
		$.append(anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}