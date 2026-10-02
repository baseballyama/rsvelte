import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const counter = ($$anchor) => {
	$.next();

	var text = $.text('Test');

	$.append($$anchor, text);
};

var root = $.from_html(`<!> <button>change</button>`, 1);

export default function Main($$anchor) {
	let state = $.proxy({ value: counter });
	var fragment = root();
	var node = $.first_child(fragment);

	$.snippet(node, () => state.value);

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => state.value = undefined);
	$.append($$anchor, fragment);
}

$.delegate(['click']);