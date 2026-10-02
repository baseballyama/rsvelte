import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Input($$anchor) {
	var p = root();

	p.textContent = `${a ?? ''} ${b ?? ''} : ${c ?? ''} :`;
	$.append($$anchor, p);
}