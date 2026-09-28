import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const failed = ($$anchor) => {
	var div = root();

	$.append($$anchor, div);
};

var root = $.from_html(`<div>Fallback!</div>`);
var root_1 = $.from_html(`<!> <button>+</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function throw_error() {
		throw new Error('test');
	}

	let count = $.state(0);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.boundary(
		node,
		{
			get failed() {
				return failed;
			},
			onerror: (e) => console.log('error caught')
		},
		($$anchor) => {
			$.next();

			var text = $.text();

			$.template_effect(($0) => $.set_text(text, $0), [() => $.get(count) > 0 ? throw_error() : null]);
			$.append($$anchor, text);
		}
	);

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);