import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div> <div>...</div>`, 1);

export default function Style_directive01_input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { property: 'value' });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { property: 'value' });

	var div_2 = $.sibling(div_1, 2);

	$.set_style(div_2, '', {}, { property: 'value' });

	var div_3 = $.sibling(div_2, 2);

	$.set_style(div_3, '', {}, { color: 'red' });
	$.append($$anchor, fragment);
}