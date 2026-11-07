import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Ternary02_input($$anchor) {
	var div = root();

	$.set_style(
		div,
		`
    position: ${position ?? ''};
    ${pointerEvents === false ? 'pointer-events:none;' : ''}
  `,
		{},
		{ top: position === "absolute" ? "20px" : null }
	);

	$.append($$anchor, div);
}