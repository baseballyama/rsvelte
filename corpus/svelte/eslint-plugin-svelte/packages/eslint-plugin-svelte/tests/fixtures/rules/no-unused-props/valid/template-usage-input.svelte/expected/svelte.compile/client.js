import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<h1> </h1> <p> </p> <ul></ul>`, 1);

export default function Template_usage_input($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	var fragment = root_1();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);
	var ul = $.sibling(p, 2);

	$.each(ul, 21, () => $$props.items, $.index, ($$anchor, item) => {
		var li = root();
		var text_2 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_2, $.get(item)));
		$.append($$anchor, li);
	});

	$.reset(ul);

	$.template_effect(() => {
		$.set_text(text, $$props.title);
		$.set_text(text_1, $$props.description);
	});

	$.append($$anchor, fragment);
	$.pop();
}