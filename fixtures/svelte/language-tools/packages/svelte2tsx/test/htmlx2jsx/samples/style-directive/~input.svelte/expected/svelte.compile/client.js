import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>Hello</div> <div>Hello</div> <div>Hello</div> <div>Hello</div> <div>Hello</div> <div>Hello</div> <div>Hello</div> <div>Hello</div> <div>Hello</div> <div>Hello</div> <div>Hello</div> <div></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { shorthand });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { attr: value });

	var div_2 = $.sibling(div_1, 2);

	$.set_style(div_2, '', {}, { value });

	var div_3 = $.sibling(div_2, 2);

	$.set_style(div_3, '', {}, { attr: value });

	var div_4 = $.sibling(div_3, 2);

	$.set_style(div_4, '', {}, { attr: 'string' });

	var div_5 = $.sibling(div_4, 2);

	$.set_style(div_5, '', {}, { attr: 'string' });

	var div_6 = $.sibling(div_5, 2);

	$.set_style(div_6, '', {}, { attr: `string${mixed ?? ''}` });

	var div_7 = $.sibling(div_6, 2);

	$.set_style(div_7, '', {}, { attr: `string${mixed ?? ''}` });

	var div_8 = $.sibling(div_7, 2);

	$.set_style(div_8, '', {}, { attr: `${mixed ?? ''}string` });

	var div_9 = $.sibling(div_8, 2);

	$.set_style(div_9, '', {}, { attr: `string${mixed ?? ''}string` });

	var div_10 = $.sibling(div_9, 2);

	$.set_style(div_10, '', {}, { attr: `template${literal}` });

	var div_11 = $.sibling(div_10, 2);

	$.set_style(div_11, '', {}, { shorthand });
	$.append($$anchor, fragment);
}