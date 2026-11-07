import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const failed = ($$anchor, error = $.noop, reset = $.noop) => {
	var button = root();

	$.delegated('click', button, function (...$$args) {
		reset()?.apply(this, $$args);
	});

	$.append($$anchor, button);
};

var root = $.from_html(`<button>oops! try again</button>`);

export default function _3_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.boundary(
		node,
		{
			get failed() {
				return failed;
			}
		},
		($$anchor) => {
			$.next();

			var text = $.text('...');

			$.append($$anchor, text);
		}
	);

	$.append($$anchor, fragment);
}

$.delegate(['click']);