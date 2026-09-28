import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Test from './Test.svelte';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor, e = $.noop) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `caught: ${e().message ?? ''}`));
			$.append($$anchor, p);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			Test($$anchor, {});
		});
	}

	$.append($$anchor, fragment);
}