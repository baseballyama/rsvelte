import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { color: 'red' });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { color: 'red' });

	var div_2 = $.sibling(div_1, 2);

	$.set_style(div_2, '', {}, { color: 'red' });

	var div_3 = $.sibling(div_2, 2);

	$.set_style(div_3, '', {}, { color: `red${variable ?? ''}` });

	var div_4 = $.sibling(div_3, 2);

	$.set_style(div_4, '', {}, { color: `red${variable ?? ''}` });

	var div_5 = $.sibling(div_4, 2);

	$.set_style(div_5, '', {}, { color: `red${variable ?? ''}` });

	var div_6 = $.sibling(div_5, 2);

	$.set_style(div_6, '', {}, { color: `template${literal}` });
	$.append($$anchor, fragment);
}