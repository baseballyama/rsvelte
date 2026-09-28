import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let count = $.state(0);

	function increment() {
		$.set(count, $.get(count) + 1);
	}

	var button = root();
	var event_handler = $.derived(increment);
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));

	$.delegated('click', button, function (...$$args) {
		$.get(event_handler)?.apply(this, $$args);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);