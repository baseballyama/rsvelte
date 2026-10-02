import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<div>...</div> <div style="background: green">...</div> <div>...</div> <div style="
    background-repeat: repeat;
    background-color: green;
  ">...</div> <div>...</div>`,
	1
);

export default function Test01_input($$anchor) {
	let red = 'red';
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { background: red });

	var div_1 = $.sibling(div, 4);

	$.set_style(div_1, '', {}, { 'background-repeat': 'repeat', 'background-color': 'green' });

	var div_2 = $.sibling(div_1, 4);

	$.set_style(div_2, 'background-color: green', {}, { 'background-repeat': 'repeat' });
	$.append($$anchor, fragment);
}