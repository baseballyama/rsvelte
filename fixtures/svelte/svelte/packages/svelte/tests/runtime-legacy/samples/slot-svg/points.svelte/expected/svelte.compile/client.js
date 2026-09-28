import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<circle></circle>`);

export default function Points($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var circle = root();

		$.set_attribute(circle, 'cx', 10);
		$.set_attribute(circle, 'cy', 10);
		$.set_attribute(circle, 'r', 5);
		$.append($$anchor, circle);
	});

	$.append($$anchor, fragment);
}