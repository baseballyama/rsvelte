import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Sub($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	function increment() {
		$.set(count, $.get(count) + 1);
	}

	const decrement = () => {
		$.set(count, $.get(count) - 1);
	};

	const double = function () {
		$.set(count, $.get(count) * 2);
	};

	var $$exports = { increment, decrement, double };
	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));
	$.append($$anchor, p);

	return $.pop($$exports);
}