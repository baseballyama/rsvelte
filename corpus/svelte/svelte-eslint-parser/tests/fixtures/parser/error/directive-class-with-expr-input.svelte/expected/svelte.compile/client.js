import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>A</div> <div>A</div>`, 1);

export default function Directive_class_with_expr_input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_class(div, 1, '', null, {}, { 'Number.EPSILON': Number.EPSILON });

	var div_1 = $.sibling(div, 2);

	$.set_class(div_1, 1, '', null, {}, { 'Number(2)': Number(2) });
	$.append($$anchor, fragment);
}