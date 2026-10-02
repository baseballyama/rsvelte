import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Increment</button>`);

export default function _1_2_$inspect_ts_input($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	;;

	var // or `console.trace`, or whatever you want
	button = root();

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);