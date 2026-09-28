import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div> <div> </div>`, 1);

export default function Main($$anchor) {
	let arr = [];

	arr[5] = true;

	let state = $.proxy([]);

	state[5] = true;

	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[() => 2 in $.snapshot(state), () => 5 in $.snapshot(state)]
	);

	$.append($$anchor, fragment);
}