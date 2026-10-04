import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p><button>Retry</button>`, 1);

var root_1 = $.from_html(`<p>Ready</p>`);

export default function Boundary_failed_object($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	{
		const failed = ($$anchor, $$arg0, reset = $.noop) => {
			let message = () => ($$arg0?.()).message;
			var fragment_1 = root();
			var p = $.first_child(fragment_1);
			var text = $.only_child(p, true);
			var button = $.sibling(p);
			$.template_effect(() => $.set_text(text, message()));
			$.delegated('click', button, function (...$$args) {
				reset()?.apply(this, $$args);
			});
			$.append($$anchor, fragment_1);
		};
		$.boundary(node, { failed }, ($$anchor) => {
			var p_1 = root_1();
			$.append($$anchor, p_1);
		});
	}
	$.append($$anchor, fragment);
}

$.delegate(['click']);
