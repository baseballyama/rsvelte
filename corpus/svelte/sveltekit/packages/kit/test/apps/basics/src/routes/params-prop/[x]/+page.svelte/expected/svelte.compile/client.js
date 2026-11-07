import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `x: ${$$props.params.x ?? ''}`));
	$.append($$anchor, p);
	$.pop();
}