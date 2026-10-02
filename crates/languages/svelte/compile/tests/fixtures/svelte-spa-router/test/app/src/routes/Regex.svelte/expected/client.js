import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h2 class="routetitle">Regex route</h2> <p>Match is: <code id="regexmatch"> </code></p>`, 1);

export default function Regex($$anchor, $$props) {
	let params = $.prop($$props, 'params', 19, () => ({}));
	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);
	var code = $.sibling($.child(p));
	var text = $.only_child(code, true);

	$.reset(p);
	$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify(params())]);
	$.append($$anchor, fragment);
}