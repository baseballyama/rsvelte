import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function test() {}

	$$renderer.select({ value: test() }, ($$renderer) => {});
}