import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const foo = ($$anchor, msg = $.noop) => {
	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, msg()));
	$.append($$anchor, p);
};

var root = $.from_html(`<p> </p>`);

export default function Input($$anchor) {
	foo($$anchor, () => msg);
}