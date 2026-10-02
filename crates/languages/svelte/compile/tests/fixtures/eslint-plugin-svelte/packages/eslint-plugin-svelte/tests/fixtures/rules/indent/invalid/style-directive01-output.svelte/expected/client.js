import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div> <div></div> <div></div>`, 1);

export default function Style_directive01_output($$anchor) {
	let color = 'red';
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { color });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { color: '\n      rred\n    ' });

	var div_2 = $.sibling(div_1, 2);

	$.set_style(div_2, '', {}, { color });

	var div_3 = $.sibling(div_2, 2);

	$.set_style(div_3, '', {}, { color: 'red' });

	var div_4 = $.sibling(div_3, 2);

	$.set_style(div_4, '', {}, { color: '\n      red\n    ' });
	$.append($$anchor, fragment);
}