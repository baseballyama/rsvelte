import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Seo($$anchor, $$props) {
	$.push($$props, true);

	var p = root();

	$.head('ki78ts', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = $$props.post.title ?? '';
		});
	});

	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $$props.post.title));
	$.append($$anchor, p);
	$.pop();
}