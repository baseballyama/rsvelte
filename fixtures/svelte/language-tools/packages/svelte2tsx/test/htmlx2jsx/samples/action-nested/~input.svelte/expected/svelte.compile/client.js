import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<svg></svg> <div><input/> <p></p> <unknowntag></unknowntag></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var svg = $.first_child(fragment);

	$.action(svg, ($$node) => svgAction?.($$node));

	var div = $.sibling(svg, 2);
	var input = $.child(div);

	$.action(input, ($$node) => action?.($$node));

	var p = $.sibling(input, 2);

	$.action(p, ($$node) => pAction?.($$node));

	var unknownTag = $.sibling(p, 2);

	$.action(unknownTag, ($$node) => unknownAction?.($$node));
	$.reset(div);
	$.action(div, ($$node) => divAction?.($$node));
	$.append($$anchor, fragment);
}