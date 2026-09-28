import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span>`);

export default function Row($$anchor, $$props) {
	var span = root();
	var text = $.only_child(span, true);

	$.template_effect(() => $.set_text(text, $$props.id));
	$.append($$anchor, span);
}