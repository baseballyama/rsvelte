import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Element_class_only_static($$anchor) {
	const active = true;
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, () => 'div', false, ($$element, $$anchor) => {
		$.set_class($$element, 0, '', null, {}, { active });
	});
	$.append($$anchor, fragment);
}
