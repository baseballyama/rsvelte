import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test01_input($$anchor) {
	var fragment = $.comment();

	$.head('12wxdv3', ($$anchor) => {});

	var node = $.first_child(fragment);

	$.element(node, () => ({}), false);
	$.append($$anchor, fragment);
}