import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button class="svelte-1yt84dg"> </button>`);

export default function CounterLabel($$anchor, $$props) {
	let label = $.prop($$props, 'label', 3, '');
	let count = $.state(0);
	const text = $.derived(() => `${label()} - ${$.get(count)}`);
	var button = root();
	var text_1 = $.only_child(button, true);

	$.template_effect(() => $.set_text(text_1, $.get(text)));

	$.delegated('click', button, () => {
		$.set(count, $.get(count) + 1);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);