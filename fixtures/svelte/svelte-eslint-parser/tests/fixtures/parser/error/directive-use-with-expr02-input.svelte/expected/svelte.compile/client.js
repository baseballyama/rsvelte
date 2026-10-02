import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Directive_use_with_expr02_input($$anchor) {
	const obj = { 'a()': (node) => node.textContent = 'Success' };
	var div = root();

	$.action(div, ($$node) => obj['a()']?.($$node));
	$.append($$anchor, div);
}