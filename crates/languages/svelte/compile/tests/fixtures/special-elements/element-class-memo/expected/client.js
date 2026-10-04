import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Element_class_memo($$anchor, $$props) {
	$.push($$props, true);
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, () => $$props.tag, false, ($$element, $$anchor) => {
		let classes;
		$.template_effect(($0) => classes = $.set_class($$element, 0, 'base', null, classes, { active: $0 }), [() => $$props.active()]);
	});
	$.append($$anchor, fragment);
	$.pop();
}
