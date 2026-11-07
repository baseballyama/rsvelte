import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div contenteditable="true"><!></div>`);

export default function Test($$anchor, $$props) {
	let innerText = $.state(void 0);

	;;

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.bind_content_editable('innerHTML', div, () => $.get(innerText), ($$value) => $.set(innerText, $$value));
	$.append($$anchor, div);
}