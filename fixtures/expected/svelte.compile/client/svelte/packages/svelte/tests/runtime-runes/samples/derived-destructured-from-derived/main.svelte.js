import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let name = $.state('foo');
	const foo = $.derived(() => $.get(name));
	const length = $.derived(() => $.get(foo).length);
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(length)));
	$.delegated('click', button, () => $.set(name, 'longer'));
	$.append($$anchor, button);
}

$.delegate(['click']);