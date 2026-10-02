import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1>`);

export default function _2_input($$anchor) {
	let user = { firstname: 'Ada', lastname: 'Lovelace' };
	var h1 = root();

	$.template_effect(() => {
		console.log({ user: $.snapshot(user) });

		debugger;
	});

	var text = $.only_child(h1);

	$.template_effect(() => $.set_text(text, `Hello ${user.firstname ?? ''}!`));
	$.append($$anchor, h1);
}