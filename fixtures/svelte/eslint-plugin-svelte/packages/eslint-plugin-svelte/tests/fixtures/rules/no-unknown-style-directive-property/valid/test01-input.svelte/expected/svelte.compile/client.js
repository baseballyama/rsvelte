import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-1ppgh71">...</div> <div class="svelte-1ppgh71">...</div> <div style="unknown-color: red" class="svelte-1ppgh71">...</div> <div class="svelte-1ppgh71">...</div>`, 1);

export default function Test01_input($$anchor) {
	let red = 'red';
	let color = red;
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { color: red });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { color });

	var div_2 = $.sibling(div_1, 4);

	$.set_style(div_2, '', {}, { '--color': red });
	$.append($$anchor, fragment);
}