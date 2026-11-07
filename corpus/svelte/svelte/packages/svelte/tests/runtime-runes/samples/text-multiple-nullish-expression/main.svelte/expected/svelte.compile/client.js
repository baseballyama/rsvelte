import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);

export default function Main($$anchor) {
	function fn() {}

	var li = root();
	var text = $.only_child(li);

	$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''}${$1 ?? ''}`), [() => fn(), () => null && fn()]);
	$.append($$anchor, li);
}