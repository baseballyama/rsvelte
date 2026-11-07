import * as $ from 'svelte/internal/server';
import Inner from './Inner.svelte';

export default function Directive_on_with_expr_like_input($$renderer) {
	const foo = { bar: () => alert('foo.bar') };

	Inner($$renderer, {});
}