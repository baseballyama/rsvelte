import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	class Foo {}

	$.bind_props($$props, { Foo });
}