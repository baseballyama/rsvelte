import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Test from './Test.svelte';

var root = $.from_html(`<button>reset</button>`);

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const pending = ($$anchor) => {
			$.next();

			var text = $.text('pending');

			$.append($$anchor, text);
		};

		const failed = ($$anchor, _ = $.noop, reset = $.noop) => {
			var button = root();

			$.delegated('click', button, function (...$$args) {
				reset()?.apply(this, $$args);
			});

			$.append($$anchor, button);
		};

		$.boundary(node, { pending, failed }, ($$anchor) => {
			Test($$anchor, {});
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);