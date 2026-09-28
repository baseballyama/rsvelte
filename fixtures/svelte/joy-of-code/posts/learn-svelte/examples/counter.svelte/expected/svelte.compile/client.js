import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container"><button> </button></div>`);

export default function Counter($$anchor) {
	let count = $.state(0);
	var div = root();
	var button = $.child(div);
	var text = $.only_child(button);

	$.reset(div);
	$.template_effect(() => $.set_text(text, `Count: ${$.get(count) ?? ''}`));
	$.delegated('click', button, () => $.set(count, $.get(count) + 1));
	$.append($$anchor, div);
}

$.delegate(['click']);