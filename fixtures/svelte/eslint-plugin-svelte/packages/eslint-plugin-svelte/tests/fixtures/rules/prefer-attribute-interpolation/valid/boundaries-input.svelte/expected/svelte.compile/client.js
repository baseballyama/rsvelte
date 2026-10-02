import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <!>`, 1);

export default function Boundaries_input($$anchor) {
	let foo = 'foo';
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_attribute(div, 'data-text', 'prefix foofoo suffix');

	var div_1 = $.sibling(div, 2);

	$.set_attribute(div_1, 'data-text', foo ? `foo${foo}` : 'bar');

	var div_2 = $.sibling(div_1, 2);

	$.set_attribute(div_2, /* comment */ 'data-text', `prefix${foo}`);

	var div_3 = $.sibling(div_2, 2);

	$.set_attribute(div_3, 'data-text', `line\n${foo}`);

	var div_4 = $.sibling(div_3, 2);

	$.set_attribute(div_4, 'data-text', `prefix{${foo}`);

	var div_5 = $.sibling(div_4, 2);

	$.set_style(div_5, '', {}, { color: `rgb(${foo})` });

	var div_6 = $.sibling(div_5, 2);

	$.set_attribute(div_6, 'data-text', 'prefix' + foo);

	var div_7 = $.sibling(div_6, 2);

	$.set_attribute(div_7, 'data-text', `static`);

	var node = $.sibling(div_7, 2);

	HyperMD(node, {
		value: `# ${foo}

Text goes here`
	});

	$.append($$anchor, fragment);
}