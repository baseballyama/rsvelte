import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	let arr = [];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => undefined, ($$anchor, $$component) => {
		$.bind_this($$component($$anchor, {}), ($$value) => arr[0] = $$value, () => arr?.[0]);
	});

	$.append($$anchor, fragment);
}