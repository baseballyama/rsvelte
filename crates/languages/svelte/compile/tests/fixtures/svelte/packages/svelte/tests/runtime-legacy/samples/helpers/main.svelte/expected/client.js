import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	function reverse(str) {
		let reversed = '';
		let i = str.length;

		while (i--) reversed += str[i];

		return reversed;
	}

	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => reverse('backwards')]);
	$.append($$anchor, p);
}