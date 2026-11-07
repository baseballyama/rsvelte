import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li></li>`);

export default function Template_curly_spacing_test_input($$anchor) {
	const item = {};
	var li = root();

	$.template_effect(() => $.set_class(li, 1, `bytemd-toc-${item.level}`));
	$.append($$anchor, li);
}