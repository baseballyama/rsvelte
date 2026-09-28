import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span>trigger</span>`);

export default function Trigger($$anchor, $$props) {
	$.push($$props, true);

	// Reads reactive state during teardown
	$.user_effect(() => {
		return () => {
			$$props.getValue();
		};
	});

	var span = root();

	$.append($$anchor, span);
	$.pop();
}