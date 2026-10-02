import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="link"> </a>`);

export default function Attributes($$anchor, $$props) {
	var a = root();
	var text = $.only_child(a, true);
	$.template_effect(() => {
		$.set_attribute(a, 'href', $$props.href);
		$.set_attribute(a, 'title', `go to ${$$props.label ?? ''}`);
		$.set_text(text, $$props.label);
	});
	$.append($$anchor, a);
}
