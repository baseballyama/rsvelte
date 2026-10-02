import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Hello</button>`);

export default function Test01_input($$anchor) {
	const handler = (ev) => {
		console.log(ev);
	};

	function onClick(event) {
		const target = event.currentTarget;
		const deepObj = { deep: { obj: { target } } };

		target.addEventListener('focus', handler);
		deepObj.deep.obj.target.addEventListener('focus', handler);
	}

	addEventListener('message', handler);
	window.addEventListener('message', handler);
	document.addEventListener('visibilitychange', handler);

	// with a load of whitespace
	window.addEventListener('message', handler);

	// with a comment
	window.addEventListener(/* foo */ 'message', handler);

	// with options
	window.addEventListener('message', handler, { once: true });

	// using spread
	window.addEventListener(...params);

	var button = root();

	$.delegated('click', button, onClick);
	$.append($$anchor, button);
}

$.delegate(['click']);