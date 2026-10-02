import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor, e = $.noop) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `error: ${e() ?? ''}`));
			$.append($$anchor, p);
		};

		$.boundary(node, { onerror: (e) => e, failed }, ($$anchor) => {
			ComponentThatFails($$anchor, {});
		});
	}

	$.append($$anchor, fragment);
}