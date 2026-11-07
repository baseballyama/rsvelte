import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from "svelte";

var root = $.from_html(`<button>fork 1</button> <button>fork 2</button> <button>commit</button> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let state = $.state(0);
	let count = $.derived(() => $.get(state));

	$.user_pre_effect(() => {
		console.log($.get(count));
	});

	let forked;
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var p = $.sibling(button_2, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(count)));

	$.delegated('click', button, () => {
		forked?.discard?.();

		forked = fork(() => {
			$.update(state);
		});
	});

	$.delegated('click', button_1, () => {
		forked?.discard?.();

		forked = fork(() => {
			$.update(state);
		});
	});

	$.delegated('click', button_2, () => {
		forked?.commit();
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);