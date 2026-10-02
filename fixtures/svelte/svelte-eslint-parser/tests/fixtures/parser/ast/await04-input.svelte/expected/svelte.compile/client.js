import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Await04_input($$anchor) {
	const p = Promise.resolve();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => p, ($$anchor) => {}, ($$anchor, v) => {});
	$.append($$anchor, fragment);
}