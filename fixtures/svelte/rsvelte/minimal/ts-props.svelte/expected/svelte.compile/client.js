import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Ts_props($$anchor, $$props) {
	let count = $.prop($$props, 'count', 3, 0);
	const shout = (s) => s.toUpperCase();
	var p = root();
	var text = $.only_child(p);

	$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} has ${count() ?? ''}`), [() => shout($$props.name)]);
	$.append($$anchor, p);
}