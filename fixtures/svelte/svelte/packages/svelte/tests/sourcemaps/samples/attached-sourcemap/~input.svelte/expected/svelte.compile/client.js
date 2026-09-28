import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="done_replace_style_2"></h1>`);

export default function Input($$anchor) {
	let replace_me_script = 'hello';
	var h1 = root();

	h1.textContent = Math.random() < 1 && done_replace_script_2;
	$.append($$anchor, h1);
}