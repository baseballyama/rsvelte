import * as $ from 'svelte/internal/server';

export default function Component_with_getters($$renderer, $$props) {
	function test() {
		return 1;
	}

	class Foo {}

	const bar = true;

	$.bind_props($$props, { test, Foo, bar });
}