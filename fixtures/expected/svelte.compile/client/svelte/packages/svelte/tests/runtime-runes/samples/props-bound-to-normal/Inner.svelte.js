import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Inner($$anchor, $$props) {
	$.push($$props, true);

	let bar = $.prop($$props, 'bar', 15);
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, bar()));
	$.event('click', button, () => $.update_prop(bar, -1));
	$.append($$anchor, button);
	$.pop();
}