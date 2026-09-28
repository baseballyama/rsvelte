import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="button">Update Text</button> <div> </div>`, 1);

export default function Main($$anchor) {
	let text = $.state('');

	function update_text() {
		$.set(text, 'updated');
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);
	var text_1 = $.only_child(div, true);

	$.template_effect(() => $.set_text(text_1, $.get(text)));
	$.event('click', button, update_text);
	$.append($$anchor, fragment);
}