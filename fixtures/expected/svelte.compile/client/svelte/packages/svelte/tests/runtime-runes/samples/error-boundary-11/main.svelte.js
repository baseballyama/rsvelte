import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <button>+</button> <button>change error message</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function throw_error() {
		throw new Error('test');
	}

	let count = $.state(0);
	let props = $.state($.proxy({ onerror: (e) => console.log('error caught') }));
	var fragment = root();
	var node = $.first_child(fragment);

	$.boundary(
		node,
		{
			get onerror() {
				return $.get(props).onerror;
			}
		},
		($$anchor) => {
			$.next();

			var text = $.text();

			$.template_effect(($0) => $.set_text(text, $0), [() => $.get(count) > 0 ? throw_error() : null]);
			$.append($$anchor, text);
		}
	);

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, () => $.update(count));
	$.delegated('click', button_1, () => $.set(props, { onerror: () => console.log('error caught!!!') }, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);