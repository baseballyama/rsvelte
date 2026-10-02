import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div> <div style="color: red;">...</div> <div>...</div> <div>...</div> <div>...</div>`, 1);

export default function _2_input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { color: 'red' });

	var div_1 = $.sibling(div, 4);

	$.set_style(div_1, '', {}, { color: myColor });

	var div_2 = $.sibling(div_1, 2);

	$.set_style(div_2, '', {}, { color });

	var div_3 = $.sibling(div_2, 2);

	$.set_style(div_3, '', {}, {
		color,
		width: '12rem',
		'background-color': darkMode ? "black" : "white"
	});

	$.append($$anchor, fragment);
}