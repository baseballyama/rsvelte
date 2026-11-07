import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>some content</p> <!>`, 1);
var root_1 = $.from_html(`<button>throw</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let should_throw = $.state(false);

	function throw_error() {
		throw new Error('oops');
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.boundary(node, {}, ($$anchor) => {
		var fragment_1 = root();
		var node_1 = $.sibling($.first_child(fragment_1), 2);

		{
			var consequent = ($$anchor) => {
				var text = $.text();

				$.template_effect(($0) => $.set_text(text, $0), [() => throw_error()]);
				$.append($$anchor, text);
			};

			$.if(node_1, ($$render) => {
				if ($.get(should_throw)) $$render(consequent);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.delegated('click', button, () => $.set(should_throw, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);