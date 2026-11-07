import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p> </p> <p> </p>`, 1);

export default function Child($$anchor, $$props) {
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2, true);

	$.template_effect(() => {
		$.set_text(text, $$props.random);
		$.set_text(text_1, $$props.random);
		$.set_text(text_2, $$props.random);
	});

	$.append($$anchor, fragment);
}