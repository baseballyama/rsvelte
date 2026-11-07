import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const test = ($$anchor, $$arg0) => {
	let param = $.derived_safe_equal(() => $.fallback($$arg0?.(), "default"));
	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(param)));
	$.append($$anchor, p);
};

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	test($$anchor);
}