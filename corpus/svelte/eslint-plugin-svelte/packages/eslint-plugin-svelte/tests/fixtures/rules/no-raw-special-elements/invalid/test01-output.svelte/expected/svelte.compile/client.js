import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test01_output($$anchor) {
	var fragment = $.comment();

	$.head('xmp7vf', ($$anchor) => {});

	var node = $.first_child(fragment);

	$.element(node, () => ({}), false);
	$.append($$anchor, fragment);
}