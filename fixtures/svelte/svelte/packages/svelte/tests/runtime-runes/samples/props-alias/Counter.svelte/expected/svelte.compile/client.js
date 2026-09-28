import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Counter($$anchor, $$props) {
	$.push($$props, true);

	let definedCount = $.prop($$props, 'count', 15);
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, definedCount()));
	$.event('click', button, () => $.update_prop(definedCount));
	$.append($$anchor, button);
	$.pop();
}