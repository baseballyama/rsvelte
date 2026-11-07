import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p>pending</p>`);
var root_1 = $.from_html(`<button>reset</button> <button>a</button> <button>b</button> <button>increment</button> <!> `, 1);

export default function Main($$anchor) {
	let num = $.state(1);
	let deferred = $.state($.proxy(Promise.withResolvers()));
	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var node = $.sibling(button_3, 2);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			Child($$anchor, {
				get promise() {
					return $.get(deferred).promise;
				},

				get num() {
					return $.get(num);
				}
			});
		});
	}

	var text = $.sibling(node);

	$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [() => console.log(`outside boundary ${$.get(num)}`)]);
	$.delegated('click', button, () => $.set(deferred, Promise.withResolvers(), true));
	$.delegated('click', button_1, () => $.get(deferred).resolve(42));
	$.delegated('click', button_2, () => $.get(deferred).resolve(43));
	$.delegated('click', button_3, () => $.set(num, $.get(num) + 1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);