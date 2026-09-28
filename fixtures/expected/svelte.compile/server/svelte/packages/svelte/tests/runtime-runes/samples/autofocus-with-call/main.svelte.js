import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function test() {}

	$$renderer.push(`<input${$.attr('autofocus', test(), true)}/>`);
}