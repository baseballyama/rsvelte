import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Loading</p>`);

var root_1 = $.from_html(`<p> </p><button>Retry</button>`, 1);

var root_2 = $.from_html(`<p>Ready</p>`);

export default function Boundary_snippets($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	{
		const pending = ($$anchor) => {
			var p = root();
			$.append($$anchor, p);
		};
		const failed = ($$anchor, error = $.noop, reset = $.noop) => {
			var fragment_1 = root_1();
			var p_1 = $.first_child(fragment_1);
			var text = $.only_child(p_1, true);
			var button = $.sibling(p_1);
			$.template_effect(() => $.set_text(text, error().message));
			$.delegated('click', button, function (...$$args) {
				reset()?.apply(this, $$args);
			});
			$.append($$anchor, fragment_1);
		};
		$.boundary(node, { pending, failed }, ($$anchor) => {
			var p_2 = root_2();
			$.append($$anchor, p_2);
		});
	}
	$.append($$anchor, fragment);
}

$.delegate(['click']);
