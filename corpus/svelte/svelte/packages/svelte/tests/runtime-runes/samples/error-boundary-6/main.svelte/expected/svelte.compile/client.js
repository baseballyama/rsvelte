import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>There is an error!</div>`);
var root_1 = $.from_html(`<!> <button>+</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function throw_error() {
		throw new Error('test');
	}

	let count = $.state(0);
	let error = $.state(void 0);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.boundary(node, { onerror: (e) => $.set(error, e, true) }, ($$anchor) => {
		$.next();

		var text = $.text();

		$.template_effect(($0) => $.set_text(text, $0), [() => $.get(count) > 0 ? throw_error() : null]);
		$.append($$anchor, text);
	});

	var button = $.sibling(node, 2);
	var node_1 = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($.get(error)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);