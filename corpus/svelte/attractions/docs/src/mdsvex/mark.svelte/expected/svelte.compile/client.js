import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<mark><!></mark>`);

export default function Mark($$anchor, $$props) {
	var mark = root();
	var node = $.child(mark);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(mark);
	$.append($$anchor, mark);
}