import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let name = "world";
	let name2 = "world";

	$.bind_props($$props, { name3: name, name4: name2 });
}