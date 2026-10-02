import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>err</div>`);
var root_1 = $.from_html(`<!> <button>toggle</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let must_throw = $.state(false);
	let reset = $.state(null);

	function throw_error() {
		throw new Error("error on template render");
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.boundary(node, { onerror: console.error }, ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			const failed = ($$anchor) => {
				var div = root();

				$.append($$anchor, div);
			};

			$.boundary(node_1, { onerror: (_, fn) => $.set(reset, fn, true), failed }, ($$anchor) => {
				$.next();

				var text = $.text();

				$.template_effect(($0) => $.set_text(text, $0), [() => $.get(must_throw) ? throw_error() : 'normal content']);
				$.append($$anchor, text);
			});
		}

		$.append($$anchor, fragment_1);
	});

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => {
		$.set(must_throw, !$.get(must_throw));

		if ($.get(reset)) $.get(reset)();
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);