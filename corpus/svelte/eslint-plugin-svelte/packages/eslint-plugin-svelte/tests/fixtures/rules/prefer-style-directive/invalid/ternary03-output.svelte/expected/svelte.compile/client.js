import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Ternary03_output($$anchor) {
	var div = root();

	$.set_style(div, '', {}, { 'pointer-events': pointerEvents ? null : 'none' });
	$.append($$anchor, div);
}