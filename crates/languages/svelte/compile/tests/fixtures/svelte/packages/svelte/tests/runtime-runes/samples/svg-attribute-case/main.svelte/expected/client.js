import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<!><!><svg viewBox=""></svg>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, () => 'svg', true, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ viewBox: '0 0 10 10' }));
	});

	var node_1 = $.sibling(node);

	$.element(node_1, () => 'svg', true, ($$element_1, $$anchor) => {
		$.attribute_effect($$element_1, () => ({ xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 10 10' }));
	});

	$.next();
	$.append($$anchor, fragment);
}