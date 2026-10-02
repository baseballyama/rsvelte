import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p>loading...</p>`);
var root_1 = $.from_html(`<button>x</button> <button>y</button> <!>`, 1);

export default function Main($$anchor) {
	let x = $.state('x1');
	let y = 'y1';
	const deferred = Promise.withResolvers();
	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			Child($$anchor, {
				get x() {
					return $.get(x);
				},
				y,
				get deferred() {
					return deferred;
				}
			});
		});
	}

	$.delegated('click', button, () => $.set(x, 'x2'));
	$.delegated('click', button_1, () => deferred.resolve('y2'));
	$.append($$anchor, fragment);
}

$.delegate(['click']);