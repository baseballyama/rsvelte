import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let count = $.state(0);
	let fn = () => ({ n: $.get(count) });

	let $$d = $.derived(fn),
		n = $.derived(() => $.get($$d).n);

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(n) ?? ''}`));
	$.delegated('click', button, () => $.set(count, $.get(count) + 1));
	$.append($$anchor, button);
}

$.delegate(['click']);