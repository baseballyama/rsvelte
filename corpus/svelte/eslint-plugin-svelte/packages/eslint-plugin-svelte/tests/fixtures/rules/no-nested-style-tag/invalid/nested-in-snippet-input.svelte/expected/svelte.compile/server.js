import * as $ from 'svelte/internal/server';

function foo($$renderer) {
	$$renderer.push(`<style>span { color: green; }</style>`);
}

export default function Nested_in_snippet_input($$renderer) {}