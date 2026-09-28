import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	function assertThisLine() {}

	$$renderer.push(`<!---->${$.escape(foo.bar.baz)}`);
}