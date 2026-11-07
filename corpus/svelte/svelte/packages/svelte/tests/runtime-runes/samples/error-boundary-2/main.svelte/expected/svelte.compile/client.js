import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <button>+</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function throw_error() {
		throw new Error('test');
	}

	let count = $.state(0);
	var fragment = root();
	var node = $.first_child(fragment);

	$.boundary(node, { onerror: (e) => console.log('error caught') }, ($$anchor) => {
		$.next();

		var text = $.text();

		$.template_effect(($0) => $.set_text(text, $0), [() => $.get(count) > 0 ? throw_error() : null]);
		$.append($$anchor, text);
	});

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);