import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <button>a</button>`, 1);

export default function Input($$anchor) {
	let a = 0, b = $.derived(() => a * 2);
	let c = 0;
	let d = $.derived(() => c * 2);
	let e = 0, f = e;

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = `0${$.get(b) ?? ''}0${$.get(d) ?? ''}00 `;

	var button = $.sibling(text);

	$.delegated('click', button, () => {
		console.log(a);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);