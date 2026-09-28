import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div> <div>...</div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { color: 'red' });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, {
		color,
		width: '12rem',
		'background-color': darkMode ? 'black' : 'white'
	});

	$.append($$anchor, fragment);
}