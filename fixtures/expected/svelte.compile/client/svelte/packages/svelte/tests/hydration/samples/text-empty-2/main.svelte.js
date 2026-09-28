import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span><span> </span> </span>`);

export default function Main($$anchor, $$props) {
	var span = root();
	var span_1 = $.child(span);
	var text = $.only_child(span_1, true);
	var text_1 = $.sibling(span_1, 1, true);

	$.reset(span);

	$.template_effect(() => {
		$.set_text(text, $$props.name);
		$.set_text(text_1, $$props.remaining >= 2 ? ',' : '');
	});

	$.append($$anchor, span);
}