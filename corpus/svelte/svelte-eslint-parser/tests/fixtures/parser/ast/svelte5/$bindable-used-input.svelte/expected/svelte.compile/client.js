import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Click Me!</button>`);

export default function $bindable_used_input($$anchor, $$props) {
	$.push($$props, true);

	let b = $.prop($$props, 'b', 15);

	function handler() {
		$.update_prop(b);
	}

	var button = root();

	$.delegated('click', button, handler);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);