import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from "svelte";

var root = $.from_html(`<button>fork</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let state = $.state(0);
	let count = $.derived(() => $.get(state));
	var button = root();

	$.delegated('click', button, () => {
		fork(() => {
			$.update(state);
			console.log($.get(count));
			$.update(state);
			console.log($.get(count));
		});
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);