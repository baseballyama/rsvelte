import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<div id="first"></div> <div id="second"></div>`, 1);

export default function Main($$anchor) {
	let message = "the quick brown fox jumps over the lazy dog";
	var fragment = root_1();
	var div = $.first_child(fragment);

	$.each(div, 21, () => message, $.index, ($$anchor, char) => {
		var span = root();
		var text = $.only_child(span, true);

		$.template_effect(() => $.set_text(text, $.get(char)));
		$.append($$anchor, span);
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);

	$.each(div_1, 21, () => message, $.index, ($$anchor, char) => {
		var span_1 = root();
		var text_1 = $.only_child(span_1, true);

		$.template_effect(() => $.set_text(text_1, $.get(char)));
		$.append($$anchor, span_1);
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}