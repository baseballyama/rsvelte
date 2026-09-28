import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	const counter = ($$anchor) => {
		const doubled = $.derived(() => $.get(count) * 2);
		var button = root();
		var text = $.only_child(button, true);

		$.template_effect(() => $.set_text(text, $.get(doubled)));
		$.event('click', button, () => $.set(count, $.get(count) + 1));
		$.append($$anchor, button);
	};

	let count = $.state(0);

	counter($$anchor);
}