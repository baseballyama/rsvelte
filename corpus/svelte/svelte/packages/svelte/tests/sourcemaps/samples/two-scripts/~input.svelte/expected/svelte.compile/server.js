import * as $ from 'svelte/internal/server';

export let first;

export default function Input($$renderer) {
	function assertThisLine() {}

	$$renderer.push(`<!---->${$.escape(foo.bar.baz)}`);
}