import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor, error = $.noop) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `caught: ${error() ?? ''}`));
			$.append($$anchor, p);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(($0) => $.set_text(text_1, $0), [
				() => (() => {
					throw 'catch me';
				})()
			]);

			$.append($$anchor, text_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}