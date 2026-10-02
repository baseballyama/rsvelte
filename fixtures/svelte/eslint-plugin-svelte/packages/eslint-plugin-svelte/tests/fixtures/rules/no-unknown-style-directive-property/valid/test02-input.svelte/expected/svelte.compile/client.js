import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div> <div>...</div> <div>...</div> <div>...</div> <div>...</div>`, 1);

export default function Test02_input($$anchor) {
	let transform = 'scale(2)';
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { '-moz-transform': transform });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { '-ms-transform': transform });

	var div_2 = $.sibling(div_1, 2);

	$.set_style(div_2, '', {}, { '-o-transform': transform });

	var div_3 = $.sibling(div_2, 2);

	$.set_style(div_3, '', {}, { '-webkit-transform': transform });

	var div_4 = $.sibling(div_3, 2);

	$.set_style(div_4, '', {}, { transform });
	$.append($$anchor, fragment);
}