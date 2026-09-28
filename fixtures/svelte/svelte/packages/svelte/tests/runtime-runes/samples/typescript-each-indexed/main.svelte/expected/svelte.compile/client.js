import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span>`);

export default function Main($$anchor) {
	let letters = ['a', 'b', 'c'];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => letters, $.index, ($$anchor, letter, i) => {
		var span = root();
		var text = $.only_child(span);

		$.template_effect(() => $.set_text(text, `${i}: ${$.get(letter) ?? ''}`));
		$.append($$anchor, span);
	});

	$.append($$anchor, fragment);
}