import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p>pending</p>`);
var root_1 = $.from_html(`<button>switch to d2</button> <button>resolve d1</button> <button>resolve d2</button> <!>`, 1);

export default function Main($$anchor) {
	let d1 = $.proxy(Promise.withResolvers());
	let d2 = $.proxy(Promise.withResolvers());
	let deferred = $.state(d1);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var node = $.sibling(button_2, 2);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			Child($$anchor, {
				get promise() {
					return $.get(deferred).promise;
				}
			});
		});
	}

	$.delegated('click', button, () => $.set(deferred, d2));
	$.delegated('click', button_1, () => d1.resolve('one'));
	$.delegated('click', button_2, () => d2.resolve('two'));
	$.append($$anchor, fragment);
}

$.delegate(['click']);