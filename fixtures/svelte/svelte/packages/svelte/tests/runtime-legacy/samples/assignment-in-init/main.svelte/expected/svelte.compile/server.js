import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let foo;
	let bar = (foo = 1) * 2;
	const get_foo = () => foo;
	const get_bar = () => bar;

	$.bind_props($$props, { get_foo, get_bar });
}