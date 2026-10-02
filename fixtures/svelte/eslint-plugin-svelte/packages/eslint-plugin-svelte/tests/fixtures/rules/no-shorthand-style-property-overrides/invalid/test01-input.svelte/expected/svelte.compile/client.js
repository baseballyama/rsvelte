import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<div>...</div> <div>...</div> <div style="
    background-repeat: repeat;
    background: green;
  ">...</div> <div>...</div> <div>...</div> <div>...</div>`,
	1
);

export default function Test01_input($$anchor) {
	let red = 'red';
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { 'background-repeat': 'repeat', background: 'green' });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { 'background-repeat': 'repeat', background: red });

	var div_2 = $.sibling(div_1, 4);

	$.set_style(div_2, '\n    background-repeat: repeat;\n    background: red;\n  ');

	var div_3 = $.sibling(div_2, 2);

	$.set_style(div_3, 'background: green', {}, { 'background-repeat': 'repeat' });

	var div_4 = $.sibling(div_3, 2);

	$.set_style(div_4, 'background: red', {}, { 'background-repeat': 'repeat' });
	$.append($$anchor, fragment);
}