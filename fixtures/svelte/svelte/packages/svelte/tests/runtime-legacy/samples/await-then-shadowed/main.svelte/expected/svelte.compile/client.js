import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function Main($$anchor) {
	const x = Promise.resolve(10);
	var div = root();
	var node = $.child(div);

	$.await(
		node,
		() => x,
		($$anchor) => {
			var text_1 = $.text('Loading...');

			$.append($$anchor, text_1);
		},
		($$anchor, x) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(x)));
			$.append($$anchor, text);
		}
	);

	$.reset(div);
	$.append($$anchor, div);
}