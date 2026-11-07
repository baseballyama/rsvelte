import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>A</div> <div>A</div>`, 1);

export default function Directive_style_with_expr_input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { 'Number.EPSILON': Number.EPSILON });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { 'Number(2)': Number(2) });
	$.append($$anchor, fragment);
}