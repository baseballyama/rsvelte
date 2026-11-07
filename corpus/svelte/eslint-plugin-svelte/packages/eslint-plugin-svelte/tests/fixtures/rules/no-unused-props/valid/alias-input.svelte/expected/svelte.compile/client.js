import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1> <div>svelte/no-unused-props does not always respect aliases</div>`, 1);

export default function Alias_input($$anchor, $$props) {
	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var div = $.sibling(h1, 2);

	$.template_effect(() => {
		$.set_text(text, $$props.test);
		$.set_attribute(div, 'aria-label', $$props['aria-label']);
	});

	$.append($$anchor, fragment);
}