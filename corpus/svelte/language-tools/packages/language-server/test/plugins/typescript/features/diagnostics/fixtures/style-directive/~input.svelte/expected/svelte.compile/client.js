import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div>`, 1);

export default function Input($$anchor) {
	let right = 'string';
	let wrong = true;
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { right });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { right });

	var div_2 = $.sibling(div_1, 2);

	$.set_style(div_2, '', {}, { right: 12 });

	var div_3 = $.sibling(div_2, 2);

	$.set_style(div_3, '', {}, { right: 'right' });

	var div_4 = $.sibling(div_3, 2);

	$.set_style(div_4, '', {}, { right: `right${right}` });

	var div_5 = $.sibling(div_4, 2);

	$.set_style(div_5, '', {}, { right: 'rightstring' });

	var div_6 = $.sibling(div_5, 2);

	$.set_style(div_6, '', {}, { undefined });

	var div_7 = $.sibling(div_6, 2);

	$.set_style(div_7, '', {}, { null: null });

	var div_8 = $.sibling(div_7, 2);

	$.set_style(div_8, '', {}, { wrong });

	var div_9 = $.sibling(div_8, 2);

	$.set_style(div_9, '', {}, { wrong });
	$.append($$anchor, fragment);
}