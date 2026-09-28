import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<circle cx="500" cy="500" r="500"></circle>`);

export default function Main($$anchor) {
	let props = { height: '100px', width: '100px', viewBox: '0 0 1000 1000' };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => 'svg', false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ ...props }));

		var circle = root();

		$.append($$anchor, circle);
	});

	$.append($$anchor, fragment);
}