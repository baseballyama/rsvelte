import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Element_class_directive($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, () => $$props.tag, false, ($$element, $$anchor) => {
		let classes;
		$.template_effect(() => classes = $.set_class($$element, 0, 'base', null, classes, { active: $$props.active }));
	});
	$.append($$anchor, fragment);
}
