import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span id="prop"> </span>`);

export default function Component($$anchor, $$props) {
	var span = root();
	var text_1 = $.only_child(span, true);

	$.template_effect(() => $.set_text(text_1, $$props.text));
	$.append($$anchor, span);
}