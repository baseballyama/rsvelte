import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Lint_cases($$anchor, $$props) {
	let unused = 1;
	var button = root();
	var text = $.only_child(button, true);
	$.template_effect(() => $.set_text(text, $$props.label));
	$.append($$anchor, button);
}
