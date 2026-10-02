import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span></span> <div class="svelte-17kaci9"></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var span = $.first_child(fragment);

	$.set_class(span, 1, 'svelte-17kaci9', null, {}, { foo: true });

	var div = $.sibling(span, 2);

	$.set_style(div, '', {}, { '--foo': 'bar' });
	$.append($$anchor, fragment);
}