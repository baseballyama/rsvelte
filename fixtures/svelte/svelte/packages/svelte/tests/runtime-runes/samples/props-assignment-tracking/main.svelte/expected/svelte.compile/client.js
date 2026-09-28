import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>display</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let display = $.prop($$props, 'display', 7, true);

	$.user_effect(() => {
		display(true);
		console.log("effect");
	});

	var button = root();

	$.delegated('click', button, () => display(!display()));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);