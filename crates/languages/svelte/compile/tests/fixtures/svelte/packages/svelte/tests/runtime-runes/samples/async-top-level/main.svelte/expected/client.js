import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p>pending</p>`);
var root_1 = $.from_html(`<button>hello</button> <!>`, 1);

export default function Main($$anchor) {
	let deferred = $.proxy(Promise.withResolvers());
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			Child($$anchor, {
				get promise() {
					return deferred.promise;
				}
			});
		});
	}

	$.delegated('click', button, () => deferred.resolve('hello'));
	$.append($$anchor, fragment);
}

$.delegate(['click']);