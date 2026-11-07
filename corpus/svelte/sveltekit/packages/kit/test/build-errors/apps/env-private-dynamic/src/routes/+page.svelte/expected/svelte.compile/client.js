import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p>Awaiting...</p>`);

export default function _page($$anchor) {
	const p = import('$app/env/private');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => p,
		($$anchor) => {
			var p_2 = root_1();

			$.append($$anchor, p_2);
		},
		($$anchor, envModule) => {
			var p_1 = root();
			var text = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text, $.get(envModule).SHOULD_EXPLODE));
			$.append($$anchor, p_1);
		}
	);

	$.append($$anchor, fragment);
}