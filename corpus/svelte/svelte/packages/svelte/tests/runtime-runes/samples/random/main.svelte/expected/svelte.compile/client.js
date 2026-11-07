import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let m = $.prop($$props, 'm', 3, 1);
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[
			() => (Math.random() * m()).toFixed(10),
			() => (Math.random() * m()).toFixed(10)
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}