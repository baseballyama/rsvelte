import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>increment</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let a = $.state(1);
	let b = $.state(1);
	let c = $.state(1);

	$.user_effect(() => {
		console.log({ a: $.get(a) });
	});

	$.user_effect(() => {
		console.log({ b: $.get(b) });
	});

	$.user_effect(() => {
		console.log({ c: $.get(c) });
	});

	function increment() {
		$.set(b, $.get(b) + 1);
		$.set(c, $.get(c) + 1);
		$.set(a, $.get(a) + 1);
	}

	var button = root();

	$.delegated('click', button, increment);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);