import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Element_xmlns($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, () => $$props.tag, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ xmlns: $$props.ns }));
	}, () => $$props.ns);
	$.append($$anchor, fragment);
}
