import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { on } from 'svelte/events';

var root = $.from_html(`<button>Hello</button>`);

export default function Test01_input($$anchor, $$props) {
	$.push($$props, true);

	const handler = (ev) => {
		console.log(ev);
	};

	function onClick(event) {
		const target = event.currentTarget;

		on(target, 'focus', handler);
	}

	on(window, 'message', handler);
	on(document, 'visibilitychange', handler);

	var button = root();

	$.delegated('click', button, onClick);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);