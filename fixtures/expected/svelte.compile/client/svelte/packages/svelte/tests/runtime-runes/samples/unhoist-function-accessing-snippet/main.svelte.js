import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const snip = ($$anchor) => {
		$.next();

		var text = $.text();

		text.nodeValue = 'snippet 0';
		$.append($$anchor, text);
	};

	const log = () => {
		if (!snip) throw new Error('oops');
	};

	let x = 0;
	var button = root();

	$.delegated('click', button, log);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);