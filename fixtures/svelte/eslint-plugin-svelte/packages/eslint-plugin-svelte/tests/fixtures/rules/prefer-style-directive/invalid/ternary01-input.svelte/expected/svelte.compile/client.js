import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div>`, 1);

export default function Ternary01_input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, `
    position: ${position ?? ''};
    ${position === 'absolute' ? 'top: 20px;' : ''}
    ${pointerEvents === false ? 'pointer-events:none;' : ''}
  `);

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, position === "absolute" ? "top: 20px;" : "");
	$.append($$anchor, fragment);
}