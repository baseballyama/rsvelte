import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const array = [1, 2, 3, [4]];
	const [a, b, c, [d]] = array;
	var $$exports = { a, b, c, d };

	return $.pop($$exports);
}