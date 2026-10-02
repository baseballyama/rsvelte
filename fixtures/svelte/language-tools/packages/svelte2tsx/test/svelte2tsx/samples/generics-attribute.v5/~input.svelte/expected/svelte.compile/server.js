import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	/** @type {{ a: A; b: B; c: C }} */
	const { a, b, c } = $$props;

	function getA() {
		return a;
	}

	$.bind_props($$props, { getA });
}