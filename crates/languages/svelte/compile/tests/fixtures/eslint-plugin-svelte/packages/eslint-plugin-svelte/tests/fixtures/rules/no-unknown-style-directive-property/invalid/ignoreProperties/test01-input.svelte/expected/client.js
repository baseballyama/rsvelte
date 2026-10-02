import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div> <div>...</div> <div>...</div> <div>...</div> <div>...</div> <div>...</div> <div>...</div> <div>...</div>`, 1);

export default function Test01_input($$anchor) {
	let red = 'red';
	let unknown = red;
	let foo = red;
	let bar = red;
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { 'unknown-color': red });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { unknown });

	var div_2 = $.sibling(div_1, 2);

	$.set_style(div_2, '', {}, { foo: red });

	var div_3 = $.sibling(div_2, 2);

	$.set_style(div_3, '', {}, { foo });

	var div_4 = $.sibling(div_3, 2);

	$.set_style(div_4, '', {}, { bar: red });

	var div_5 = $.sibling(div_4, 2);

	$.set_style(div_5, '', {}, { bar });

	var div_6 = $.sibling(div_5, 2);

	$.set_style(div_6, '', {}, { 'bar-foo': red });

	var div_7 = $.sibling(div_6, 2);

	$.set_style(div_7, '', {}, { 'foo-bar': red });
	$.append($$anchor, fragment);
}