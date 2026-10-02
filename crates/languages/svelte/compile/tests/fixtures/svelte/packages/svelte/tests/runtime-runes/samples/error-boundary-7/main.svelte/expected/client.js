import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<div>Error!</div> <button>Retry</button>`, 1);

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor, e = $.noop, retry = $.noop) => {
			var fragment_1 = root();
			var button = $.sibling($.first_child(fragment_1), 2);

			$.delegated('click', button, function (...$$args) {
				retry()?.apply(this, $$args);
			});

			$.append($$anchor, fragment_1);
		};

		$.boundary(node, { onerror: (e) => console.log('error caught'), failed }, ($$anchor) => {
			Child($$anchor, {});
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);