import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

let set = new Set(['x']);
var root = $.from_html(`<p> </p>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => set.has('x')]);
	$.append($$anchor, p);
	$.pop();
}