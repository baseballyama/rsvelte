import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>toggle hidden</button> <div>hello world (with spread attrs)</div>`, 1);

export default function Main($$anchor) {
	let hidden = $.state(true);
	const restProps = { id: '123' };
	var fragment = root();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);

	$.attribute_effect(div, () => ({ ...restProps, hidden: $.get(hidden) }));
	$.delegated('click', button, () => $.set(hidden, !$.get(hidden)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);