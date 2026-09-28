import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<!> <ul></ul>`, 1);

export default function Component($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);

	var ul = $.sibling(node, 2);

	$.each(ul, 21, () => Object.getOwnPropertyNames(rest), $.index, ($$anchor, n) => {
		var li = root();
		var text = $.only_child(li, true);

		$.template_effect(() => $.set_text(text, $.get(n)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.append($$anchor, fragment);
}