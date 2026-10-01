import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<ul></ul>`);

export default function Each_unkeyed($$anchor) {
	let names = $.proxy(['Ada', 'Grace', 'Barbara']);
	var ul = root_1();

	$.each(ul, 21, () => names, $.index, ($$anchor, name) => {
		var li = root();
		var text = $.only_child(li, true);

		$.template_effect(() => $.set_text(text, $.get(name)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.append($$anchor, ul);
}