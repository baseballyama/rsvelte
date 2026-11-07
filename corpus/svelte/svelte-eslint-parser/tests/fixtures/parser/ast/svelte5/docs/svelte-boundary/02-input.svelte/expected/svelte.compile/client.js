import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>oops! try again</button>`);

export default function _2_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor, error = $.noop, reset = $.noop) => {
			var button = root();

			$.delegated('click', button, function (...$$args) {
				reset()?.apply(this, $$args);
			});

			$.append($$anchor, button);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			FlakyComponent($$anchor, {});
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);