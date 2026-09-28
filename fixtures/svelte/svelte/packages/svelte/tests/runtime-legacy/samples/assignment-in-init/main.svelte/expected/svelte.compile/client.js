import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let foo;
	let bar = (foo = 1) * 2;
	const get_foo = () => foo;
	const get_bar = () => bar;
	var $$exports = { get_foo, get_bar };

	return $.pop($$exports);
}