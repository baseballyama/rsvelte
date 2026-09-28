import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><p data-foo="BAR" class="svelte-jl8ozb">this is styled</p> <p data-foo="BAZ">this is unstyled</p></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}