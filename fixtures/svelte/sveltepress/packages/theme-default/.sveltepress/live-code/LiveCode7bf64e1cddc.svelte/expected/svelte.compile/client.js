import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function LiveCode7bf64e1cddc($$anchor) {
	let count = $.state(1);
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `You've clicked ${$.get(count) ?? ''} times`));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, button);
}

$.delegate(['click']);