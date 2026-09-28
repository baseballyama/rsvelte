import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function throws() {
		throw new Error('component error');
	}

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
			var p_1 = root();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(($0) => $.set_text(text_1, $0), [() => throws()]);
			$.append($$anchor, p_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}