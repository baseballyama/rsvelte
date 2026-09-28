import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div id="5"><div id="3"><div id="1"></div> <div id="2"></div></div> <div id="4"></div></div> <div id="6"></div>`, 1);

export default function Main($$anchor) {
	const action = (element) => {
		console.log(element.id);
	};

	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.action(div_2, ($$node) => action?.($$node));

	var div_3 = $.sibling(div_2, 2);

	$.action(div_3, ($$node) => action?.($$node));
	$.reset(div_1);
	$.action(div_1, ($$node) => action?.($$node));

	var div_4 = $.sibling(div_1, 2);

	$.action(div_4, ($$node) => action?.($$node));
	$.reset(div);
	$.action(div, ($$node) => action?.($$node));

	var div_5 = $.sibling(div, 2);

	$.action(div_5, ($$node) => action?.($$node));
	$.append($$anchor, fragment);
}