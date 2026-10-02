import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click me</button>`);

export default function Input($$anchor) {
	let tmp = {}, a = $.state($.proxy(tmp.a));
	let b = $.derived(() => $.get(a).b);
	var button = root();

	$.delegated('click', button, () => $.update(a));
	$.append($$anchor, button);
}

$.delegate(['click']);