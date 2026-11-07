import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<svg><circle cx="12" cy="12" r="10"></circle></svg> <math><mi>x</mi></math> <custom-element></custom-element>`, 3);

export default function Main($$anchor) {
	const userdata = {
		ONCLICK: 'alert(document.cookie)',
		ONMOUSEOVER: 'alert("XSS")'
	};

	var fragment = root();
	var svg = $.first_child(fragment);

	$.attribute_effect(svg, () => ({ ...userdata }));

	var math = $.sibling(svg, 2);

	$.attribute_effect(math, () => ({ ...userdata }));

	var custom_element = $.sibling(math, 2);

	$.attribute_effect(custom_element, () => ({ ...userdata }));
	$.append($$anchor, fragment);
}