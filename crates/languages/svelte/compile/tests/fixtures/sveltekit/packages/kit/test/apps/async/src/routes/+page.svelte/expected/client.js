import 'svelte/internal/disclose-version';
import { routes } from '$app/manifest';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li><a> </a></li>`);
var root_1 = $.from_html(`<h3>Tests</h3> <ul></ul>`, 1);

export default function _page($$anchor) {
	var fragment = root_1();
	var ul = $.sibling($.first_child(fragment), 2);

	$.set_style(ul, '', {}, { 'font-family': 'sans-serif' });

	$.each(ul, 21, () => routes, $.index, ($$anchor, route) => {
		var li = root();
		var a = $.child(li);
		var text = $.only_child(a, true);

		$.reset(li);

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(route).id);
			$.set_text(text, $.get(route).id);
		});

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.append($$anchor, fragment);
}