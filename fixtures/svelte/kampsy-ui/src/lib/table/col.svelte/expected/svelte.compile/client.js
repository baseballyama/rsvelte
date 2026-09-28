import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<col/>`);

export default function Col($$anchor, $$props) {
	let klass = $.prop($$props, 'class', 3, "");
	var col = root();

	$.template_effect(() => $.set_class(col, 1, $.clsx(klass())));
	$.append($$anchor, col);
}