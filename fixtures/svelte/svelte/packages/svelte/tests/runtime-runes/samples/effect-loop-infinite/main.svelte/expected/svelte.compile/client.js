import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>toggle</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let condition = $.state(false);
	let count = $.state(0);

	$.user_effect(() => {
		if ($.get(condition)) {
			$.update(count);
		}
	});

	var button = root();

	$.delegated('click', button, () => $.set(condition, !$.get(condition)));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);