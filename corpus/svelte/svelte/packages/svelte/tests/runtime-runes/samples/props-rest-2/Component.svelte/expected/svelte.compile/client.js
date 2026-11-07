import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<ul></ul>`);

export default function Component($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var ul = root_1();

	$.each(ul, 21, () => Object.getOwnPropertyNames(rest), $.index, ($$anchor, n) => {
		var li = root();
		var text = $.only_child(li, true);

		$.template_effect(() => $.set_text(text, $.get(n)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.append($$anchor, ul);
}