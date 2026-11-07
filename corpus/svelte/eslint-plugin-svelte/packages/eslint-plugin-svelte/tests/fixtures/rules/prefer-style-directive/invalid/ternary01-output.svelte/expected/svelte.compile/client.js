import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div>`, 1);

export default function Ternary01_output($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(
		div,
		`
    ${position === 'absolute' ? 'top: 20px;' : ''}
  `,
		{},
		{
			position,
			'pointer-events': pointerEvents === false ? 'none' : null
		}
	);

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { top: position === "absolute" ? "20px" : null });
	$.append($$anchor, fragment);
}