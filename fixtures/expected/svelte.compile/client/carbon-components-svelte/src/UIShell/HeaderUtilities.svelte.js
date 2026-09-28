import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function HeaderUtilities($$anchor, $$props) {
	var div = root();

	$.set_class(div, 1, '', null, {}, { 'bx--header__global': true });

	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div);
	$.append($$anchor, div);
}