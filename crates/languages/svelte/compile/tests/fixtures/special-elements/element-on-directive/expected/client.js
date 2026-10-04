import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Element_on_directive($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, () => $$props.tag, false, ($$element, $$anchor) => {
		$.event('click', $$element, $.once(() => {}));
	});
	$.append($$anchor, fragment);
}
