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
			var fragment_2 = $.comment();
			var node_1 = $.first_child(fragment_2);

			$.boundary(node_1, {}, ($$anchor) => {
				var fragment_3 = $.comment();
				var node_2 = $.first_child(fragment_3);

				$.boundary(
					node_2,
					{
						onerror: (e) => {
							throw e;
						}
					},
					($$anchor) => {
						Child($$anchor, {});
					}
				);

				$.append($$anchor, fragment_3);
			});

			$.append($$anchor, fragment_2);
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);