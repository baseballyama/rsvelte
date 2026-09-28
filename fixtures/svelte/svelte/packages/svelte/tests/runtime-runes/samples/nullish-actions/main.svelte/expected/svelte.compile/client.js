import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div>`, 1);

export default function Main($$anchor, $$props) {
	let action = void 0;
	var fragment = root();
	var div = $.first_child(fragment);

	$.action(div, ($$node) => action?.($$node));

	var div_1 = $.sibling(div, 2);

	$.action(div_1, ($$node) => $$props.action_prop?.($$node));
	$.append($$anchor, fragment);
}