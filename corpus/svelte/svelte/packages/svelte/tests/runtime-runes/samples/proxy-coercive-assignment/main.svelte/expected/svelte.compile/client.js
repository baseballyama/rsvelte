import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let items = $.state(null);
	var button = root();
	var text = $.only_child(button);

	$.template_effect(($0) => $.set_text(text, `items: ${$0 ?? ''}`), [() => JSON.stringify($.get(items))]);
	$.delegated('click', button, () => $.set(items, $.get(items) ?? [], true).push($.get(items).length));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);