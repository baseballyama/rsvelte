import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function Main($$anchor) {
	let elem = $.state(void 0);
	let nodeName = $.derived(() => $.get(elem)?.nodeName);
	var div = root();
	var text = $.only_child(div, true);

	$.bind_this(div, ($$value) => $.set(elem, $$value), () => $.get(elem));
	$.template_effect(() => $.set_text(text, $.get(nodeName)));
	$.append($$anchor, div);
}