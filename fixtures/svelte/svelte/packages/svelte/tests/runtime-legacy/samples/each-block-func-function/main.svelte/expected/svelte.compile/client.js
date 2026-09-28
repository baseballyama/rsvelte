import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => [1, 2, 3, 4, 5], $.index, ($$anchor, func) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(($0) => $.set_text(text, $0), [() => (() => func)()]);
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
	$.pop();
}