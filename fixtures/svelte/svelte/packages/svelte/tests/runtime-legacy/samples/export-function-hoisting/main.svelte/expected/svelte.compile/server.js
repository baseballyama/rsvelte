import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	function one() {
		two();
	}

	function two() {
		return one();
	}

	$$renderer.push(`<!---->Compile plz`);
	$.bind_props($$props, { one, two });
}