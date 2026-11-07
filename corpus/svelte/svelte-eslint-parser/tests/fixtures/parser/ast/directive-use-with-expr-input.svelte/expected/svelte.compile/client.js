import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Directive_use_with_expr_input($$anchor) {
	const foo = {
		bar: (node) => {
			node.textContent = 'Success';
		}
	};

	var div = root();

	$.action(div, ($$node) => foo.bar?.($$node));
	$.append($$anchor, div);
}