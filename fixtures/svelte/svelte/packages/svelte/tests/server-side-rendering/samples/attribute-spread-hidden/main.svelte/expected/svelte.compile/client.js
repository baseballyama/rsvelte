import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>A</div> <div>B</div> <div>C</div>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.attribute_effect(div, () => ({ ...{ hidden: false } }));

	var div_1 = $.sibling(div, 2);

	$.attribute_effect(div_1, () => ({ ...{ hidden: true } }));

	var div_2 = $.sibling(div_1, 2);

	$.attribute_effect(div_2, () => ({ ...{ hidden: 'until-found' } }));
	$.append($$anchor, fragment);
}