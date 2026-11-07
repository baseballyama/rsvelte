import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

function foo() {
	return (node) => node.textContent = 'Success';
}

var root = $.from_html(`<div></div>`);

export default function Directive_use_with_expr01_input($$anchor) {
	var div = root();

	$.action(div, ($$node) => foo()?.($$node));
	$.append($$anchor, div);
}