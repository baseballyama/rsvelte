import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Paragraph($$anchor, $$props) {
	$.push($$props, true);

	let boundParagraph = $.state(void 0);

	function changeBackgroundToRed() {
		$.get(boundParagraph).style.backgroundColor = 'red';
	}

	var $$exports = { changeBackgroundToRed };
	var p = root();
	var text_1 = $.only_child(p, true);

	$.bind_this(p, ($$value) => $.set(boundParagraph, $$value), () => $.get(boundParagraph));
	$.template_effect(() => $.set_text(text_1, $$props.text));
	$.append($$anchor, p);

	return $.pop($$exports);
}