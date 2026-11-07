import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Ternary03_input($$anchor) {
	var div = root();

	$.set_style(div, `
    ${pointerEvents ? '' : 'pointer-events:none'}
  `);

	$.append($$anchor, div);
}