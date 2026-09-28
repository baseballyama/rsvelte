import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <button></button>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);

	function showCount() {
		return $.get(count);
	}

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var button = $.sibling(text);

	$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} `), [() => showCount``]);
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);